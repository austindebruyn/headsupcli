module.exports = validate

/**
 * Returns nothing if this action is good. Returns an error objects with
 * a code and a reason message if this action is not allowed.
 *
 * An action can be bad because it is out of turn, the raise is too small,
 * it is an unknown action, it is cheating, etc.
 * @param  {object} action
 * @param  {Game}   game
 * @return {void|object}
 */
function validate(action, game) {
  return;
}
