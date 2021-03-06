var async     = require("async");
var assert    = require('assert');
var Remote    = require("stellar-lib").Remote;
var testutils = require("./testutils");
var config    = testutils.init_config();

suite('Account set', function() {
  var $ = { };

  setup(function(done) {
    testutils.build_setup().call($, done);
  });

  teardown(function(done) {
    testutils.build_teardown().call($, done);
  });

  test('set InflationDest', function(done) {
    var self = this;

    var steps = [
      function (callback) {
        self.what = "Set InflationDest.";

          //console.log(config.accounts.root.account);

        $.remote.transaction()
        .account_set(config.accounts.root.account)
		.inflation_dest(config.accounts.root.account)
        .on('submitted', function (m) {
          //console.log("proposed: %s", JSON.stringify(m));
            testutils.auto_advance_default( $.remote, m, callback );
        })
        .submit();
      }
    ]

    async.waterfall(steps,function (error) {
      assert(!error, self.what);
      done();
    });
  });

  
  test('set RequireDestTag', function(done) {
    var self = this;

    var steps = [
      function (callback) {
        self.what = "Set RequireDestTag.";

        $.remote.transaction()
        .account_set("root")
        .set_flags('RequireDestTag')
        .on('submitted', function (m) {
          //console.log("proposed: %s", JSON.stringify(m));
            testutils.auto_advance_default( $.remote, m, callback );
        })
        .submit();
      },

      function (callback) {
        self.what = "Check RequireDestTag";

        $.remote.request_account_flags('root', 'CURRENT')
        .on('success', function (m) {
          var wrong = !(m.node.Flags & Remote.flags.account_root.RequireDestTag);

          if (wrong) {
            console.log("Set RequireDestTag: failed: %s", JSON.stringify(m));
          }

          callback(wrong ? new Error(wrong) : null);
        })
        .request();
      },

      function (callback) {
        self.what = "Clear RequireDestTag.";

        $.remote.transaction()
        .account_set("root")
        .set_flags('OptionalDestTag')
        .on('submitted', function (m) {
          //console.log("proposed: %s", JSON.stringify(m));
            testutils.auto_advance_default( $.remote, m, callback );
        })
        .submit();
      },

      function (callback) {
        self.what = "Check No RequireDestTag";

        $.remote.request_account_flags('root', 'CURRENT')
        .on('success', function (m) {
          var wrong = !!(m.node.Flags & Remote.flags.account_root.RequireDestTag);

          if (wrong) {
            console.log("Clear RequireDestTag: failed: %s", JSON.stringify(m));
          }

          callback(wrong ? new Error(m) : null);
        })
        .request();
      }
    ]

    async.waterfall(steps,function (error) {
      assert(!error, self.what);
      done();
    });
  });

  test("set RequireAuth",  function (done) {
    var self = this;

    var steps = [
      function (callback) {
        self.what = "Set RequireAuth.";

        $.remote.transaction()
        .account_set("root")
        .set_flags('RequireAuth')
        .on('submitted', function (m) {
          //console.log("proposed: %s", JSON.stringify(m));
            testutils.auto_advance_default( $.remote, m, callback );
        })
        .submit();
      },

      function (callback) {
        self.what = "Check RequireAuth";

        $.remote.request_account_flags('root', 'CURRENT')
        .on('error', callback)
        .on('success', function (m) {
          var wrong = !(m.node.Flags & Remote.flags.account_root.RequireAuth);

          if (wrong) {
            console.log("Set RequireAuth: failed: %s", JSON.stringify(m));
          }

          callback(wrong ? new Error(m) : null);
        })
        .request();
      },

      function (callback) {
        self.what = "Clear RequireAuth.";

        $.remote.transaction()
        .account_set("root")
        .set_flags('OptionalAuth')
        .on('submitted', function (m) {
          //console.log("proposed: %s", JSON.stringify(m));

            testutils.auto_advance_default( $.remote, m, callback );
        })
        .submit();
      },

      function (callback) {
        self.what = "Check No RequireAuth";

        $.remote.request_account_flags('root', 'CURRENT')
        .on('error', callback)
        .on('success', function (m) {
          var wrong = !!(m.node.Flags & Remote.flags.account_root.RequireAuth);

          if (wrong) {
            console.log("Clear RequireAuth: failed: %s", JSON.stringify(m));
          }

          callback(wrong ? new Error(m) : null);
        })
        .request();
      }
      // XXX Also check fails if something is owned.
    ]

    async.waterfall(steps, function(error) {
      assert(!error, self.what);
      done();
    });
  });

});
