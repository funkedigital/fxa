/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ExperimentMixin from './experiment-mixin';

const EXPERIMENT_NAME = 'signupPasswordCWTS';

export default {
  dependsOn: [ExperimentMixin],

  setInitialContext(context) {
    const experimentGroup = this.getCWTSOnSignupPasswordExperimentGroup();
    if (experimentGroup) {
      this.createExperiment(EXPERIMENT_NAME, experimentGroup);
    }

    if (this.isCWTSOnSignupPasswordEnabled()) {
      context.set({
        engines: this._getOfferedEngines(),
        isCWTSOnSignupPasswordEnabled: true,
      });
    }
  },

  isCWTSOnSignupPasswordEnabled() {
    return this.getCWTSOnSignupPasswordExperimentGroup() === 'treatment';
  },

  getCWTSOnSignupPasswordExperimentGroup() {
    return this.getExperimentGroup(EXPERIMENT_NAME, {
      email: this.getAccount().get('email'),
      service: this.relier.get('service'),
    });
  },

  /**
   * Get a list of displayed Sync engine configs that can be used
   * for display.
   *
   * @returns {Object[]}
   */
  _getOfferedEngines() {
    return this.broker
      .get('chooseWhatToSyncWebV1Engines')
      .toJSON()
      .map((syncEngine, index) => {
        const engineWithTabIndex = Object.create(syncEngine);
        engineWithTabIndex.tabindex = (index + 1) * 5;
        engineWithTabIndex.text = this.translate(engineWithTabIndex.text, {});
        return engineWithTabIndex;
      });
  },

  /**
   * Get a list of engineIds that are displayed to the user.
   *
   * @returns {String[]}
   */
  _getOfferedEngineIds() {
    return this._getOfferedEngines().map(syncEngine => syncEngine.id);
  },

  /**
   * Get sync engines that were declined.
   *
   * @returns {String[]}
   */
  _getDeclinedEngineIds() {
    var uncheckedEngineEls = this.$el
      .find('input[name=sync-content]')
      .not(':checked');

    return uncheckedEngineEls
      .map(function() {
        // @ts-ignore
        return this.value;
      })
      .get();
  },

  /**
   * Keep track of what sync engines the user declines
   *
   * @param {String[]} declinedEngineIds
   */
  _trackDeclinedEngineIds(declinedEngineIds) {
    if (Array.isArray(declinedEngineIds)) {
      declinedEngineIds.forEach(engineId => {
        this.logViewEvent(`engine-unchecked.${engineId}`);
      });
    }
  },

  beforeSubmit() {
    if (this.isCWTSOnSignupPasswordEnabled()) {
      const declinedSyncEngines = this._getDeclinedEngineIds();
      const offeredSyncEngines = this._getOfferedEngineIds();

      this._trackDeclinedEngineIds(declinedSyncEngines);

      this.getAccount().set({
        declinedSyncEngines,
        offeredSyncEngines,
      });

      this.notifier.trigger(
        'set-sync-engines',
        offeredSyncEngines.filter(e => declinedSyncEngines.indexOf(e) === -1)
      );
    }
  },
};
