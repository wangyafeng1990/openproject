//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
//++

import {WorkPackagesListService} from '../../wp-list/wp-list.service';
import {States} from '../../states.service';
import {WorkPackageNotificationService} from '../../wp-edit/wp-notification.service';
import {NotificationsService} from "core-components/common/notifications/notifications.service";
import {OpModalComponent} from "core-components/op-modals/op-modal.component";
import {Component, ElementRef, Inject, OnInit} from "@angular/core";
import {$stateToken, I18nToken, OpModalLocalsToken, WorkPackageServiceToken} from "core-app/angular4-transition-utils";
import {OpModalLocalsMap} from "core-components/op-modals/op-modal.types";
import {WorkPackageResource} from 'core-app/modules/hal/resources/work-package-resource';
import {WorkPackageTableFocusService} from 'core-components/wp-fast-table/state/wp-table-focus.service';
import {StateService} from '@uirouter/core';

@Component({
  template: require('!!raw-loader!./wp-destroy.modal.html')
})
export class WpDestroyModal extends OpModalComponent implements OnInit {
  // When deleting multiple
  public workPackages:WorkPackageResource[];
  public workPackageLabel:string;

  // Single work package
  public singleWorkPackage:WorkPackageResource;
  public singleWorkPackageChildren:WorkPackageResource[];

  public text:{ [key:string]:any } = {
    label_visibility_settings: this.I18n.t('js.label_visibility_settings'),
    button_save: this.I18n.t('js.modals.button_save'),
    confirm: this.I18n.t('js.button_confirm'),
    warning: this.I18n.t('js.label_warning'),
    cancel: this.I18n.t('js.button_cancel'),
    close: this.I18n.t('js.close_popup_title'),
  };

  constructor(readonly elementRef:ElementRef,
              @Inject(WorkPackageServiceToken) readonly WorkPackageService:any,
              @Inject(OpModalLocalsToken) public locals:OpModalLocalsMap,
              @Inject(I18nToken) readonly I18n:op.I18n,
              @Inject($stateToken) readonly $state:StateService,
              readonly states:States,
              readonly wpTableFocus:WorkPackageTableFocusService,
              readonly wpListService:WorkPackagesListService,
              readonly wpNotificationsService:WorkPackageNotificationService,
              readonly notificationsService:NotificationsService) {
    super(locals, elementRef);
  }

  ngOnInit() {
    super.ngOnInit();

    this.workPackages = this.locals.workPackages;
    this.workPackageLabel = this.I18n.t('js.units.workPackage', { count: this.workPackages.length });

    // Ugly way to provide the same view bindings as the ng-init in the previous template.
    if (this.workPackages.length === 1) {
      this.singleWorkPackage = this.workPackages[0];
      this.singleWorkPackageChildren = this.singleWorkPackage.children;
    }

    this.text.title = this.I18n.t('js.modals.destroy_work_package.title', { label: this.workPackageLabel }),
    this.text.text = this.I18n.t('js.modals.destroy_work_package.text', { label: this.workPackageLabel, count: this.workPackages.length }),

    this.text.childCount = (wp:WorkPackageResource) => {
      const count = this.children(wp).length;
      return this.I18n.t('js.units.child_work_packages', {count: count});
    };

    this.text.hasChildren = (wp:WorkPackageResource) =>
      this.I18n.t('js.modals.destroy_work_package.has_children', {childUnits: this.text.childCount(wp) }),

    this.text.deletesChildren = this.I18n.t('js.modals.destroy_work_package.deletes_children');
  }


  public confirmDeletion($event:JQueryEventObject) {
    this.WorkPackageService.performBulkDelete(this.workPackages.map(el => el.id), true)
      .then(() => {
        this.closeMe($event);
        this.wpTableFocus.clear();
        this.$state.go('work-packages.list');
      });
  }

  public children(workPackage:WorkPackageResource) {
    if (workPackage.hasOwnProperty('children')) {
      return workPackage.children;
    } else {
      return [];
    }
  }
}
