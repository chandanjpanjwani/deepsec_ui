import { ApiManager } from './ApiManager'
import logger from 'electron-log'
import defaultValues from '../util/default-values';
/**
 * This manager is made to be used inside the main process.
 */
export class ApiGetConfig extends ApiManager {
  static namespace () { return 'get-config' }

  constructor (mainWindow, ipcId) {
    super(false, null, mainWindow, ipcId)
  }

  start (options) {
    return super.start({ command: 'get_config' })
  }

  registerAllAnswers () {
    this.addAnswerHandler('config', this.config)
    // Error answer
    this.addAnswerHandler('init_error', this.initError)
  }

  config (answer) {
    this.pushNotification(`DeepSec API version ${answer.version} successfully detected`)
    logger.info(`DeepSec API detected with version: ${answer.version}`)
    logger.info(`Result directory path set to: ${answer.result_files_path}`)
    defaultValues['resultsDirPath']=answer.result_files_path
  }

  initError (answer) {
    this.pushNotification('Internal error',
                          `Please report this error.<br>Message: ${answer.error_msg}`,
                          'error')
    this.eventReply({ success: false, content: answer })
  }

  /**
   * Override the event reply since it works only in the main process.
   * @param content The content of the reply.
   */
  eventReply (content) {
    /* Do nothing */
  }
}
