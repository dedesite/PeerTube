import { Component, OnInit } from '@angular/core'
import { SortMeta } from 'primeng/components/common/sortmeta'

import { NotificationsService } from 'angular2-notifications'

import { ConfirmService } from '../../../core'
import { VideoBlacklistService, RestTable, RestPagination } from '../../../shared'
import { BlacklistedVideo } from '../../../../../../shared'

@Component({
  selector: 'my-video-blacklist-list',
  templateUrl: './video-blacklist-list.component.html',
  styleUrls: []
})
export class VideoBlacklistListComponent extends RestTable implements OnInit {
  blacklist: BlacklistedVideo[] = []
  totalRecords = 0
  rowsPerPage = 10
  sort: SortMeta = { field: 'id', order: 1 }
  pagination: RestPagination = { count: this.rowsPerPage, start: 0 }

  constructor (
    private notificationsService: NotificationsService,
    private confirmService: ConfirmService,
    private videoBlacklistService: VideoBlacklistService
  ) {
    super()
  }

  ngOnInit () {
    this.loadData()
  }

  removeVideoFromBlacklist (entry: BlacklistedVideo) {
    const confirmMessage = 'Do you really want to remove this video from the blacklist ? It will be available again in the video list.'

    this.confirmService.confirm(confirmMessage, 'Remove').subscribe(
      res => {
        if (res === false) return

        this.videoBlacklistService.removeVideoFromBlacklist(entry.videoId).subscribe(
          status => {
            this.notificationsService.success('Success', `Video ${entry.name} removed from the blacklist.`)
            this.loadData()
          },

          err => this.notificationsService.error('Error', err.message)
        )
      }
    )
  }

  protected loadData () {
    this.videoBlacklistService.listBlacklist(this.pagination, this.sort)
      .subscribe(
        resultList => {
          this.blacklist = resultList.data
          this.totalRecords = resultList.total
        },

        err => this.notificationsService.error('Error', err.message)
      )
  }
}
