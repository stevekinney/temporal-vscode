import { generateCommandRegistrations } from './find-command-registrations';
import { generateCommandDocumentation } from './generate-command-documentation';
import { updatePackageManifest } from './update-package-manifest';
import { writeCommandTypes } from './write-command-types';

const commands = await generateCommandRegistrations();

await updatePackageManifest(commands);
await writeCommandTypes(commands);
await generateCommandDocumentation(commands);
