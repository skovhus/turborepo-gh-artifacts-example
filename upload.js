const { create } = require('@actions/artifact');
const core = require('@actions/core');
const path = require('path');
const fs = require('fs-extra');

async function upload() {
  const tempDir = path.join(
    process.env['RUNNER_TEMP'] || __dirname,
    'turbo-cache'
  );

  fs.ensureDirSync(tempDir);

  const client = create();

  const files = fs.readdirSync(tempDir);

  const artifactFiles = files.filter((filename) => filename.endsWith('.gz'));

  core.debug(`artifact files: ${JSON.stringify(artifactFiles, null, 2)}`);

  await Promise.all(
    artifactFiles.map(async (artifactFilename) => {
      const filenameWithoutExt = path.basename(
        artifactFilename,
        path.extname(artifactFilename)
      );

      core.info(`Uploading ${artifactFilename}`);

      await client.uploadArtifact(
        filenameWithoutExt,
        [path.join(tempDir, artifactFilename)],
        tempDir
      );

      core.info(`Uploaded ${artifactFilename} successfully`);
    })
  );
}

upload().catch(console.error);
