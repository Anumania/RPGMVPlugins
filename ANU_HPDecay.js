
//=============================================================================
// ANU_HPDecay.js
//=============================================================================

/*:
 * @plugindesc all damage applies over time just like in earthbound i think
 * @author Anumania
 *
 * @help 
 */

/*:
* @param DecayRate
 * @desc Set the rate that health decays (over the course of a second)
 * @default 60

*/
var params = PluginManager.parameters('ANU_HPDecay');


Game_BattlerBase.prototype.initMembers = function() {
    this._hp = 1;
    this._targetHP = undefined
    this._mp = 0;
    this._tp = 0;
    this._hidden = false;
    this.clearParamPlus();
    this.clearStates();
    this.clearBuffs();
};

Game_BattlerBase.prototype.setHp = function(hp) {
    this._targetHP = hp;
    this.refresh();
};

Object.defineProperties(Game_BattlerBase.prototype, {
    // Hit Points
    hp: { get: function() {return Math.round(this._hp); }, configurable: true } //i use decimals here but rpgmaker doesnt like that i think?

});

Scene_Battle.prototype.updateDecayingHealth = function(){
    for(var i = 0; i < 4; i++){
        var act = $gameParty.members()[i]
        if(act != undefined && !act.isDead()){
            if(act._targetHP === undefined) //if we are on the first frame, set the target hp to the current player hp
                act._targetHP = act._hp;
            var theSign = Math.sign(act._targetHP-act._hp);
            act._hp += theSign * (params["DecayRate"]/60);
            if(act._hp <= 0){
                act.refresh();
                this.cancelAllDeathRelatedWindows();
                this.updateStatusWindow();
            }
        }
    }
}

Scene_Battle.prototype.cancelAllDeathRelatedWindows = function(){ //exit out of all menus that can cause crashes TODO: find a differnt way to do this
    if(!this.isAnyInputWindowActive())
        return;
    this.onEnemyCancel();
    this.onSkillCancel();
    this.onItemCancel();
    this.onActorCancel();
    this.selectPreviousCommand();
}

Scene_Battle.prototype.update = function() {
    this.updateDecayingHealth();
    this.refreshStatus();
    var active = this.isActive();
    $gameTimer.update(active);
    $gameScreen.update();
    this.updateStatusWindow();
    this.updateWindowPositions();
    if (active && !this.isBusy()) {
        this.updateBattleProcess();
    }
    Scene_Base.prototype.update.call(this);
};
