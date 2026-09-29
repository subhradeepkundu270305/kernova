import { create } from 'zustand'
import { FileTreeNode } from '../../shared/types'

interface FileTreeState {
  rootPath: string | null
  rootName: string | null
  tree: FileTreeNode[]
  selectedPath: string | null

  openFolder: (folderPath: string) => Promise<void>
  loadChildren: (dirPath: string) => Promise<void>
  toggleExpand: (dirPath: string) => void
  selectNode: (path: string) => void
  refreshTree: () => Promise<void>

  createFile: (parentPath: string, name: string) => Promise<string>
  createFolder: (parentPath: string, name: string) => Promise<void>
  renameItem: (oldPath: string, newName: string) => Promise<void>
  deleteItem: (itemPath: string) => Promise<void>
}

const updateNodeInTree = (
  tree: FileTreeNode[],
  dirPath: string,
  updateFn: (node: FileTreeNode) => FileTreeNode
): FileTreeNode[] => {
  return tree.map((node) => {
    if (node.path === dirPath) {
      return updateFn(node)
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, dirPath, updateFn) }
    }
    return node
  })
}

const getFileName = (path: string) => {
  const parts = path.split(/[/\\]/)
  return parts[parts.length - 1]
}

const getParentPath = (path: string) => {
  const parts = path.split(/[/\\]/)
  parts.pop()
  return parts.join('/')
}

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  rootPath: null,
  rootName: null,
  tree: [],
  selectedPath: null,

  openFolder: async (folderPath: string) => {
    try {
      const nodes = await window.kernova.readDir(folderPath)
      await window.kernova.watchStop() // stop previous
      await window.kernova.watchStart(folderPath)

      set({
        rootPath: folderPath,
        rootName: getFileName(folderPath),
        tree: nodes,
        selectedPath: null,
      })
    } catch (error) {
      console.error('Failed to open folder:', error)
      set({
        rootPath: null,
        rootName: null,
        tree: [],
        selectedPath: null,
      })
    }
  },

  loadChildren: async (dirPath: string) => {
    try {
      set((state) => ({
        tree: updateNodeInTree(state.tree, dirPath, (node) => ({ ...node, isLoading: true })),
      }))

      const children = await window.kernova.readDir(dirPath)

      set((state) => ({
        tree: updateNodeInTree(state.tree, dirPath, (node) => ({
          ...node,
          children,
          isLoading: false,
          isExpanded: true,
        })),
      }))
    } catch (error) {
      console.error('Failed to load children:', error)
      set((state) => ({
        tree: updateNodeInTree(state.tree, dirPath, (node) => ({ ...node, isLoading: false })),
      }))
    }
  },

  toggleExpand: (dirPath: string) => {
    const state = get()

    // Find node to check if we need to load children
    let needsLoad = false
    const checkNode = (nodes: FileTreeNode[]) => {
      for (const node of nodes) {
        if (node.path === dirPath) {
          if (!node.children && node.type === 'directory') needsLoad = true
          return
        }
        if (node.children) checkNode(node.children)
      }
    }
    checkNode(state.tree)

    if (needsLoad) {
      get().loadChildren(dirPath)
    } else {
      set((state) => ({
        tree: updateNodeInTree(state.tree, dirPath, (node) => ({
          ...node,
          isExpanded: !node.isExpanded,
        })),
      }))
    }
  },

  selectNode: (path: string) => set({ selectedPath: path }),

  refreshTree: async () => {
    const state = get()
    if (!state.rootPath) return

    // Simplistic refresh: just reload the root for now.
    // In a full implementation, you'd want to maintain the expanded state.
    try {
      const nodes = await window.kernova.readDir(state.rootPath)

      // Preserve expanded state logic could go here
      const preserveExpanded = (
        newNodes: FileTreeNode[],
        oldTree: FileTreeNode[]
      ): FileTreeNode[] => {
        return newNodes.map((newNode) => {
          const oldNode = oldTree.find((n) => n.path === newNode.path)
          if (oldNode && oldNode.isExpanded && newNode.type === 'directory') {
            // In a perfect world we would recursively readDir here, but for simplicity
            // we'll let the user re-expand or use the file watcher for incremental updates
            return { ...newNode, isExpanded: oldNode.isExpanded, children: oldNode.children }
          }
          return newNode
        })
      }

      set({ tree: preserveExpanded(nodes, state.tree) })
    } catch (error) {
      console.error('Failed to refresh tree:', error)
    }
  },

  createFile: async (parentPath: string, name: string) => {
    const separator = parentPath.includes('\\') ? '\\' : '/'
    const filePath = `${parentPath}${separator}${name}`
    await window.kernova.createFile(filePath)

    const state = get()
    if (state.rootPath === parentPath) {
      await state.refreshTree()
    } else {
      await state.loadChildren(parentPath)
    }
    return filePath
  },

  createFolder: async (parentPath: string, name: string) => {
    const separator = parentPath.includes('\\') ? '\\' : '/'
    const folderPath = `${parentPath}${separator}${name}`
    await window.kernova.createFolder(folderPath)

    const state = get()
    if (state.rootPath === parentPath) {
      await state.refreshTree()
    } else {
      await state.loadChildren(parentPath)
    }
  },

  renameItem: async (oldPath: string, newName: string) => {
    const parentPath = getParentPath(oldPath)
    const separator = oldPath.includes('\\') ? '\\' : '/'
    const newPath = `${parentPath}${separator}${newName}`

    await window.kernova.renameItem(oldPath, newPath)

    const state = get()
    if (state.rootPath === parentPath) {
      await state.refreshTree()
    } else {
      await state.loadChildren(parentPath)
    }
  },

  deleteItem: async (itemPath: string) => {
    await window.kernova.deleteItem(itemPath)
    const parentPath = getParentPath(itemPath)

    const state = get()
    if (state.rootPath === parentPath) {
      await state.refreshTree()
    } else {
      await state.loadChildren(parentPath)
    }
  },
}))
