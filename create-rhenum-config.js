#!/usr/bin/env node

const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");

const configFiles = {
  prettier: ".prettierrc.json",
  eslint: ".eslintrc.json",
  tsconfig: "tsconfig.json",
};

const repoUrl =
  "https://raw.githubusercontent.com/rhenum-dev/eslint-config-rhenum/refs/heads/dev/configs/overwrite";

const questions = [
  {
    type: "list",
    name: "configAction",
    message: "Do you want to copy/overwrite or extend the configurations?",
    choices: ["Overwrite", "Extend"],
  },
];

inquirer.prompt(questions).then((answers) => {
  const { configAction } = answers;

  Object.entries(configFiles).forEach(([key, file]) => {
    const filePath = path.join(process.cwd(), file);
    const repoConfigPath = path.join(__dirname, "configs", "overwrite", file);

    // Remove existing config file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`${file} has been removed from the project!`);
    }

    if (configAction === "Overwrite") {
      // Copy/overwrite config files from repo to the project directory
      const configContent = fs.readFileSync(repoConfigPath, "utf8");
      fs.writeFileSync(filePath, configContent, "utf8");
      console.log(`${file} has been copied/overwritten!`);
    } else if (configAction === "Extend") {
      if (file === "tsconfig.json") {
        console.log("repoConfigPath", repoConfigPath);
        const configContent = fs.readFileSync(repoConfigPath, "utf8");
        fs.writeFileSync(filePath, configContent, "utf8");
      } else {
        // Create new config file to extend configurations
        const extendConfig = { extends: `${repoUrl}/${file}` };
        fs.writeFileSync(
          filePath,
          JSON.stringify(extendConfig, null, 2),
          "utf8"
        );
        console.log(`${file} has been created to extend the configuration!`);
      }
    }
  });
});
