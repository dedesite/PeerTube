import { Activity, ActivityType } from '../../../../shared/models/activitypub'
import { logger } from '../../../helpers'
import { AccountModel } from '../../../models/account/account'
import { processAcceptActivity } from './process-accept'
import { processAddActivity } from './process-add'
import { processAnnounceActivity } from './process-announce'
import { processCreateActivity } from './process-create'
import { processDeleteActivity } from './process-delete'
import { processFollowActivity } from './process-follow'
import { processLikeActivity } from './process-like'
import { processUndoActivity } from './process-undo'
import { processUpdateActivity } from './process-update'

const processActivity: { [ P in ActivityType ]: (activity: Activity, inboxAccount?: AccountModel) => Promise<any> } = {
  Create: processCreateActivity,
  Add: processAddActivity,
  Update: processUpdateActivity,
  Delete: processDeleteActivity,
  Follow: processFollowActivity,
  Accept: processAcceptActivity,
  Announce: processAnnounceActivity,
  Undo: processUndoActivity,
  Like: processLikeActivity
}

async function processActivities (activities: Activity[], signatureAccount?: AccountModel, inboxAccount?: AccountModel) {
  for (const activity of activities) {
    // When we fetch remote data, we don't have signature
    if (signatureAccount && activity.actor !== signatureAccount.url) {
      logger.warn('Signature mismatch between %s and %s.', activity.actor, signatureAccount.url)
      continue
    }

    const activityProcessor = processActivity[activity.type]
    if (activityProcessor === undefined) {
      logger.warn('Unknown activity type %s.', activity.type, { activityId: activity.id })
      continue
    }

    try {
      await activityProcessor(activity, inboxAccount)
    } catch (err) {
      logger.warn('Cannot process activity %s.', activity.type, err)
    }
  }
}

export {
  processActivities
}
