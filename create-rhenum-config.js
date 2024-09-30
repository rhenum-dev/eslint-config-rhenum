#!/usr/bin/env node

const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const configFiles = {
  prettier: ".prettierrc.json",
  eslint: ".eslintrc.json",
  tsconfig: "tsconfig.json",
};

// Packages required for the configurations
const packages = {
  eslint: [
    "eslint",
    "eslint-config-airbnb",
    "eslint-config-airbnb-typescript",
    "@typescript-eslint/parser",
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-prettier",
    "eslint-plugin-react",
    "eslint-plugin-jsx-a11y",
    "prettier",
    "eslint-config-prettier",
    "eslint-plugin-prettier"
  ],
  prettier: ["prettier"],
  typescript: ["typescript"],
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
    const repoConfigPath = path.join(__dirname, "configs", "overwrite", file);

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
          existingConfig.extends.push(
            `https://raw.githubusercontent.com/your-repo/your-configs/main/${file}`
          );
        } else if (file === "tsconfig.json") {
          existingConfig.extends = `https://raw.githubusercontent.com/your-repo/your-configs/main/${file}`;
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
          JSON.stringify(
            {
              extends: `https://raw.githubusercontent.com/your-repo/your-configs/main/${file}`,
            },
            null,
            2
          ),
          "utf8"
        );
      }
    }
  });

  // Install the necessary packages
  const packagesToInstall = [
    ...packages.eslint,
    ...packages.prettier,
    ...packages.typescript,
  ];

  try {
    console.log("Installing packages...");
    execSync(`npm install --save-dev ${packagesToInstall.join(" ")}`, {
      stdio: "inherit",
    });
    console.log("Packages installed successfully!");
  } catch (error) {
    console.error("Error installing packages:", error);
  }

  // Update package.json to add a new script
  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // Add or update the script
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts["custom-lint"] =
      "eslint . --ext .js,.jsx,.ts,.tsx --fix";

    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      "utf8"
    );
    console.log('Added "lint" script to package.json!');
  } else {
    console.error("package.json not found in the project directory.");
  }
});
