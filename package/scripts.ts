import path from "path";
import yargs from "yargs"
import {hideBin} from "yargs/helpers"
import { generateApi } from "swagger-typescript-api";
import fs from "fs/promises";
import { rollup } from 'rollup';
import {command as execaCommand, ExecaReturnValue} from "execa";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from '@rollup/plugin-typescript';
import terser from "@rollup/plugin-terser";


const paths = {
  localPackages: path.resolve(__dirname + "/node_modules/.bin"),
  topLevelDir: path.resolve(__dirname+"./../"),
  workingDir: path.resolve(__dirname),
  src: path.resolve(__dirname+"/src"),
  srcInput: path.resolve(__dirname+"/src/index.ts"),
  srcInputCdn: path.resolve(__dirname+"/src/cdn/client-script.ts"),
  openApiSpec: path.resolve(__dirname+"/src/OpenAPI-Ingest.yaml"),
  dist: path.resolve(__dirname+"/dist"),
  distCdn: path.resolve(__dirname+"/dist/cdn"),
}


const commands = ['package', 'generate-api-types'] as const;
export type Command = typeof commands[number];

const argv = yargs(hideBin(process.argv))
  .option('command', {
    alias: 'c',
    describe: 'the command you want to run',
    choices: commands
  })
  .demandOption(['c'])
  .argv as any;




(async () =>
{
  const command = argv.c as Command;
  switch (command)
  {
    case "generate-api-types":
      await generateApiTypes();
      break;
    case "package":
      await build();
      break;

  }
})();

async function generateApiTypes()
{
  console.time("* GENERATE API TYPES");
  await generateApi({
    name: "ingest-api-types.yaml",
    output: paths.src,
    input: paths.openApiSpec,
    silent: true,
    generateClient: false,
    generateRouteTypes: true,
    generateResponses: true,
    extractRequestParams: true,
    extractRequestBody: true,
    moduleNameFirstTag: true,
  });
  console.timeEnd("* GENERATE API TYPES");
}


export async function fileExists(path: string){
  return fs.open(path, 'r').then(async (file) => { await file.close(); return true; }).catch(err => false)
}
export async function folderExists(path: string){
  return fs.opendir(path).then(async (dir) => { await dir.close(); return true; }).catch(err => false)
}

async function transpile(srcInput: string, dist: string, generateTypes: boolean) {
  console.log("*** Clean: " +dist);
  let packageFolderExist = await folderExists(dist);
  if(!packageFolderExist) //create
    await fs.mkdir(dist,{ recursive: true });
  else //clear contents and recreate
  {
    await fs.rm(dist,{ recursive: true });
    await fs.mkdir(dist,{ recursive: true });
  }

  console.log("*** Transpiling: " +srcInput);
  const bundle = await rollup({
    input: srcInput,
    plugins: [
      typescript({}),
      nodeResolve({
        browser: true,
      }),
      terser({sourceMap: true}),
    ]
  });

  const fileName = path.basename(srcInput, path.extname(srcInput));
  const distOutputCjs = dist + "/"+fileName+".js";
  const distOutputEsm = dist + "/"+fileName+".mjs";
  //@ts-ignore because sourcemap is specified correctly https://github.com/terser/terser#source-map-options
  await bundle.write({file: distOutputCjs, format: 'cjs', sourcemap: {filename: "out.js", url: "out.js.map"}});
  //@ts-ignore because sourcemap is specified correctly https://github.com/terser/terser#source-map-options
  await bundle.write({file: distOutputEsm, format: 'esm', sourcemap: {filename: "out.mjs", url: "out.mjs.map"}});

  if(generateTypes)
  {
    console.log("*** Generate types - d.ts");
    await execaCommand("tsc --declaration  --emitDeclarationOnly " + srcInput + " " +
      "--outDir " + dist, {reject: true});
  }
}

async function build()
{
  console.time("* BUILD");
  console.log("* BUILD");

  console.log("** Transpiling..");
  await transpile(paths.srcInput, paths.dist, true,);
  await transpile(paths.srcInputCdn, paths.distCdn, false);

  console.log("** Coping files..");
  await fs.copyFile(paths.workingDir+"/package.json", paths.dist+"/package.json");

  // Read the package.json that will be published and remove some stuff
  let packageJson = JSON.parse((await fs.readFile(paths.dist+"/package.json")).toString());
  delete packageJson.dependencies;
  delete packageJson.scripts;
  delete packageJson.wireit;
  await fs.writeFile(paths.dist+"/package.json", JSON.stringify(packageJson, null, 2));

  await fs.copyFile(paths.topLevelDir+"/README.md", paths.dist+"/README.md");

  console.timeEnd("* BUILD");
}

