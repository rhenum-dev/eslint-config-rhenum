#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')

const CONFIG_DIR = path.resolve(__dirname) // Directory containing config files
const LOCAL_TSCONFIG_PATH = path.resolve(process.cwd(), 'tsconfig.json')
const LOCAL_ESLINT_PATH = path.resolve(process.cwd(), '.eslintrc.json')
const LOCAL_PRETTIER_PATH = path.resolve(process.cwd(), '.prettierrc.json')

// Function to update or extend a configuration file
async function updateConfig(filePath, configName) {
  try {
    // Check if local config file exists
    if (!fs.existsSync(filePath)) {
      console.log(
        `No local ${configName} found. Please ensure the ${configName} file exists in the same directory as this script.`
      )
      return
    }

    // Load the local configuration
    const localConfig = require(filePath)
    const remoteConfig = require(path.resolve(CONFIG_DIR, configName)) // Load from local directory

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `What do you want to do with ${configName}?`,
        choices: [
          `Extend local ${configName} with the hosted configuration`,
          `Overwrite local ${configName} with the hosted configuration`,
        ],
      },
    ])

    if (answers.action === `Extend local ${configName} with the hosted configuration`) {
      const mergedConfig = {
        ...localConfig,
        ...remoteConfig,
      }
      fs.writeFileSync(filePath, JSON.stringify(mergedConfig, null, 2))
      console.log(`Local ${configName} extended with hosted configuration.`)
    } else {
      fs.writeFileSync(filePath, JSON.stringify(remoteConfig, null, 2))
      console.log(`Local ${configName} overwritten with hosted configuration.`)
    }
  } catch (error) {
    console.error(`Error updating ${configName}:`, error)
  }
}

async function updateConfigurations() {
  // Update tsconfig.json
  await updateConfig(LOCAL_TSCONFIG_PATH, 'tsconfig.json')

  // Update .eslintrc.json
  await updateConfig(LOCAL_ESLINT_PATH, '.eslintrc.json')

  // Update .prettierrc.json
  await updateConfig(LOCAL_PRETTIER_PATH, '.prettierrc.json')
}

// Execute the configuration updates
updateConfigurations()
