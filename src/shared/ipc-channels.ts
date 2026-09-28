export const IPC_CHANNELS = {
  // Window controls
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:is-maximized',
  WINDOW_ON_MAXIMIZE_CHANGE: 'window:on-maximize-change',

  // Filesystem
  FS_OPEN_FOLDER: 'fs:open-folder',
  FS_READ_DIR: 'fs:read-dir',
  FS_READ_FILE: 'fs:read-file',
  FS_WRITE_FILE: 'fs:write-file',
  FS_CREATE_FILE: 'fs:create-file',
  FS_CREATE_FOLDER: 'fs:create-folder',
  FS_RENAME: 'fs:rename',
  FS_DELETE: 'fs:delete',
  FS_MOVE: 'fs:move',
  FS_STAT: 'fs:stat',
  FS_EXISTS: 'fs:exists',

  // File watching
  FS_WATCH_START: 'fs:watch-start',
  FS_WATCH_STOP: 'fs:watch-stop',
  FS_WATCH_EVENT: 'fs:watch-event',

  // Dialogs
  DIALOG_OPEN_FOLDER: 'dialog:open-folder',
  DIALOG_OPEN_FILE: 'dialog:open-file',
  DIALOG_SAVE_FILE: 'dialog:save-file',
  DIALOG_MESSAGE_BOX: 'dialog:message-box',

  // Store (settings + session)
  STORE_GET: 'store:get',
  STORE_SET: 'store:set',
  STORE_GET_SESSION: 'store:get-session',
  STORE_SET_SESSION: 'store:set-session',

  // Terminal (PTY)
  TERMINAL_CREATE: 'terminal:create',
  TERMINAL_WRITE: 'terminal:write',
  TERMINAL_RESIZE: 'terminal:resize',
  TERMINAL_DESTROY: 'terminal:destroy',
  TERMINAL_DATA: 'terminal:data',
  TERMINAL_EXIT: 'terminal:exit',

  // Git
  GIT_GET_STATUS: 'git:get-status',

  // Project Search
  SEARCH_PROJECT: 'search:project',

  // System & Network
  SYSTEM_GET_RAM: 'system:get-ram',
  SYSTEM_CHECK_ONLINE: 'system:check-online',

  // SafeStorage Secrets (OS Keychain)
  SECRETS_SET_KEY: 'secrets:set-key',
  SECRETS_GET_KEY: 'secrets:get-key',
  SECRETS_HAS_KEY: 'secrets:has-key',
  SECRETS_DELETE_KEY: 'secrets:delete-key',
} as const
