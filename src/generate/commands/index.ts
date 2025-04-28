import { generateCommandRegistrations } from './find-command-registrations';
import { updatePackageManifest } from './update-package-manifest';
import { writeCommandTypes } from './write-command-types';

const commands = await generateCommandRegistrations();

await updatePackageManifest(commands);
await writeCommandTypes(commands);
