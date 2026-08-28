let turnstileWidgetId;
let turnstileResolvers = [];

window.initTurnstile = function () {
  turnstileWidgetId = turnstile.render('#turnstile-container', {
    sitekey: '0x4AAAAAAEet1CvCPgv5JN0c',
    execution: 'execute',
    callback: function (token) {
      const resolve = turnstileResolvers.shift();
      if (resolve) resolve(token);
    },
  });
};

function getTurnstileToken() {
  return new Promise((resolve) => {
    turnstileResolvers.push(resolve);
    turnstile.execute(turnstileWidgetId);
  });
}
