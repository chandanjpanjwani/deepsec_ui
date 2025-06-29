import logger from 'electron-log'
import { Notification } from 'element-ui'
import dash from 'lodash'
import  defaultValues  from '../util/default-values'

/**
 * Send a notification depending of the user settings.
 *
 * @param {String} title The title of the notification
 * @param {String} message The content message of the notification (HTML)
 * @param {String} type The type of notification (success/warning/info/error)
 * @param {String} topic The name of the topic, for filter
 * @param {Object} link The route description for vue-router
 * @param {Object} router The vue router to use
 */
export default function notification (title,
                                      message = '',
                                      type = 'info',
                                      topic = 'default',
                                      link = null,
                                      router = null) {
  if (type === 'success' || type === 'info' || type === '') {
    // Check skip query
    if (topic === 'query' && !defaultValues.showQueryNotif) {
      return
    }

    // Check skip run
    if (topic === 'run' && !defaultValues.showRunNotif) {
      return
    }

    // Check skip batch
    if (topic === 'batch' && !defaultValues.showBatchNotif) {
      return
    }
  }

  // Set time
  let time // in ms
  if ((type === 'error' && defaultValues.stickyErrorNotif) ||
    (type === 'warning' && defaultValues.stickyWarningNotif)) {
    time = 0 // no auto dismiss
  } else {
    time = defaultValues.notificationDuration * 1000 // Seconds to ms
  }

  // If link add click event and css class
  const customClasses = ['background-' + type]
  let onClick = null
  if (link) {
    customClasses.push('clickable')
    onClick = function () {
      // Go to the route if it's not the current location
      if (router.currentRoute.name === link.name &&
        dash.isEqual(router.currentRoute.params, link.params)) {
        logger.verbose(`Try to go to the current route (${router.currentRoute.path})`)
      } else {
        router.push(link)
      }
      this.close()
    }
  }

  logger.silly(`Show notification : (${type}) [${topic}] ${title}`)
  Notification({
                 title: title,
                 message: message,
                 type: type,
                 duration: time,
                 onClick: onClick,
                 customClass: customClasses.join(' '),
                 dangerouslyUseHTMLString: true // Never a problem
               })
}
