import * as puppeteer from 'puppeteer'
import chalk from 'chalk'
import getConfig from 'vcr-config';
import {
  setup as setupServer,
  teardown as teardownServer,
  ERROR_TIMEOUT,
  ERROR_NO_COMMAND,
} from '../devServer';

let browser

export async function setup() {
  const config = await getConfig()
  if (config.connect) {
    browser = await puppeteer.connect(config.connect)
  } else {
    browser = await puppeteer.launch({
      ...config.launch,
      headless: !process.env.DEBUG,
    });
  }
  process.env.PUPPETEER_WS_ENDPOINT = browser.wsEndpoint()

  if (config.server) {
    try {
      await setupServer(config.server)
    } catch (error) {
      if (error.code === ERROR_TIMEOUT) {
        console.log('')
        console.error(chalk.red(error.message))
        console.error(
          chalk.blue(
            `\n☝️ You can set "server.launchTimeout" in vcr.config.js`,
          ),
        )
        process.exit(1)
      }
      if (error.code === ERROR_NO_COMMAND) {
        console.log('')
        console.error(chalk.red(error.message))
        console.error(
          chalk.blue(
            `\n☝️ You must set "server.command" in vcr.config.js`,
          ),
        )
        process.exit(1)
      }
      throw error
    }
  }
}

export async function teardown() {
  await teardownServer()
  await browser.close()
}
