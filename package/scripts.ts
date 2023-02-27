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
  openApiSpec: path.resolve(__dirname+"/src/OpenAPI-Ingest.yaml"),
  dist: path.resolve(__dirname+"/dist"),
  distOutputCjs: path.resolve(__dirname+"/dist/index.js"),
  distOutputEsm: path.resolve(__dirname+"/dist/index.mjs"),
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
async function build()
{
  console.time("* BUILD");

  console.log("** Clean");
  let packageFolderExist = await folderExists(paths.dist);
  if(!packageFolderExist) //create
    await fs.mkdir(paths.dist,{ recursive: true });
  else //clear contents and recreate
  {
    await fs.rm(paths.dist,{ recursive: true });
    await fs.mkdir(paths.dist,{ recursive: true });
  }


  console.log("** Bundling");
  const bundle = await rollup({
    input: paths.srcInput,
    plugins: [
      typescript({}),
      nodeResolve({
        browser: true,
      }),
      terser({sourceMap: true}),
    ]
  });
  //@ts-ignore because sourcemap is specified correctly https://github.com/terser/terser#source-map-options
  await bundle.write({ file: paths.distOutputCjs, format: 'cjs', sourcemap: { filename: "out.js", url: "out.js.map"} });
  //@ts-ignore because sourcemap is specified correctly https://github.com/terser/terser#source-map-options
  await bundle.write({ file: paths.distOutputEsm, format: 'esm', sourcemap: { filename: "out.mjs", url: "out.mjs.map"} });


  console.log("** Generate types - d.ts");
  await execaCommand("tsc --declaration  --emitDeclarationOnly "+paths.srcInput+" " +
    "--outDir "+paths.dist, { reject: true });

  console.log("** Coping files");
  await fs.copyFile(paths.workingDir+"/package.json", paths.dist+"/package.json");
  await fs.copyFile(paths.topLevelDir+"/README.md", paths.dist+"/README.md");


  console.timeEnd("* BUILD");
}

