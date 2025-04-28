import pkg from 'package.json' assert { type: 'json' };

export const extensionId = pkg.name as ExtensionId;
