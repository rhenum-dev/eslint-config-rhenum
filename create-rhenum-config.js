#!/usr/bin/env node

const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");

const configFiles = {
  prettier: ".prettierrc.json",
  eslint: ".eslintrc.json",
  tsconfig: "tsconfig.json",
};

const questions = [
  {
    type: "list",
    name: "configAction",
    message: "Do you want to copy/overwrite or extend the configurations?",
    choices: ["Copy/Overwrite", "Extend"],
  },
];

inquirer.prompt(questions).then((answers) => {
  const { configAction } = answers;

  Object.entries(configFiles).forEach(([key, file]) => {
    const filePath = path.join(process.cwd(), file);
    const repoConfigPath = path.join(
      __dirname,
      "configs",
      configAction.toLowerCase(),
      file
    );

    if (configAction === "Copy/Overwrite") {
      // Copy/overwrite config files from repo to the project directory
      const configContent = fs.readFileSync(repoConfigPath, "utf8");
      fs.writeFileSync(filePath, configContent, "utf8");
      console.log(`${file} has been copied/overwritten!`);
    } else if (configAction === "Extend") {
      // Update config files to extend configurations
      const extendConfig = JSON.parse(fs.readFileSync(repoConfigPath, "utf8"));

      if (fs.existsSync(filePath)) {
        const existingConfig = JSON.parse(fs.readFileSync(filePath, "utf8"));

        if (file === ".prettierrc.json") {
          Object.assign(existingConfig, extendConfig);
        } else if (file === ".eslintrc.json") {
          existingConfig.extends = existingConfig.extends || [];
          if (typeof existingConfig.extends === "string") {
            existingConfig.extends = [existingConfig.extends];
          }
          existingConfig.extends.push(`./configs/extend/${file}`);
        } else if (file === "tsconfig.json") {
          existingConfig.extends = `./configs/extend/${file}`;
        }

        fs.writeFileSync(
          filePath,
          JSON.stringify(existingConfig, null, 2),
          "utf8"
        );
        console.log(`${file} has been updated to extend the configuration!`);
      } else {
        console.log(
          `${file} does not exist. Creating and extending the configuration.`
        );
        fs.writeFileSync(
          filePath,
          JSON.stringify({ extends: `./configs/extend/${file}` }, null, 2),
          "utf8"
        );
      }
    }
  });
});
