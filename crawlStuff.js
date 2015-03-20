var casper = require('casper').create({
	// pageSettings: {
 //        loadImages:  false,        // The WebPage instance used by Casper will
 //        loadPlugins: false         // use these settings
 //    },
 //    silentErrors: true
});



//================================================================================
//================================================================================
// Extending Casper functions for realizing label() and goto()
// 
// Functions:
//   checkStep()   Revised original checkStep()
//   then()        Revised original then()
//   label()       New function for making empty new navigation step and affixing the new label on it.
//   goto()        New function for jumping to the labeled navigation step that is affixed by label()
//   dumpSteps()   New function for Dump Navigation Steps. This is very helpful as a flow control debugging tool.
// 

var utils = require('utils');
var f = utils.format;

/**
 * Revised checkStep() function for realizing label() and goto()
 * Every revised points are commented.
 *
 * @param  Casper    self        A self reference
 * @param  function  onComplete  An options callback to apply on completion
 */
casper.checkStep = function checkStep(self, onComplete) {
  if (self.pendingWait || self.loadInProgress) {
    return;
  }
    self.current = self.step;                 // Added:  New Property.  self.current is current execution step pointer
    var step = self.steps[self.step++];
    if (utils.isFunction(step)) {
      self.runStep(step);
        step.executed = true;                 // Added:  This navigation step is executed already or not.
      } else {
        self.result.time = new Date().getTime() - self.startTime;
        self.log(f("Done %s steps in %dms", self.steps.length, self.result.time), "info");
        clearInterval(self.checker);
        self.emit('run.complete');
        if (utils.isFunction(onComplete)) {
          try {
            onComplete.call(self, self);
          } catch (err) {
            self.log("Could not complete final step: " + err, "error");
          }
        } else {
            // default behavior is to exit
            self.exit();
          }
        }
      };


/**
 * Revised then() function for realizing label() and goto()
 * Every revised points are commented.
 *
 * @param  function  step  A function to be called as a step
 * @return Casper
 */
 casper.then = function then(step) {
  if (!this.started) {
    throw new CasperError("Casper not started; please use Casper#start");
  }
  if (!utils.isFunction(step)) {
    throw new CasperError("You can only define a step as a function");
  }
    // check if casper is running
    if (this.checker === null) {
        // append step to the end of the queue
        step.level = 0;
        this.steps.push(step);
        step.executed = false;                 // Added:  New Property. This navigation step is executed already or not.
        this.emit('step.added', step);         // Moved:  from bottom
      } else {

      if( !this.steps[this.current].executed ) {  // Added:  Add step to this.steps only in the case of not being executed yet.
        // insert substep a level deeper
        try {
//          step.level = this.steps[this.step - 1].level + 1;   <=== Original
            step.level = this.steps[this.current].level + 1;   // Changed:  (this.step-1) is not always current navigation step
          } catch (e) {
            step.level = 0;
          }
          var insertIndex = this.step;
          while (this.steps[insertIndex] && step.level === this.steps[insertIndex].level) {
            insertIndex++;
          }
          this.steps.splice(insertIndex, 0, step);
        step.executed = false;                    // Added:  New Property. This navigation step is executed already or not.
        this.emit('step.added', step);            // Moved:  from bottom
      }                                           // Added:  End of if() that is added.

    }
//    this.emit('step.added', step);   // Move above. Because then() is not always adding step. only first execution time.
return this;
};


/**
 * Adds a new navigation step by 'then()'  with naming label
 *
 * @param    String    labelname    Label name for naming execution step
 */
 casper.label = function label( labelname ) {
  var step = new Function('"empty function for label: ' + labelname + ' "');   // make empty step
  step.label = labelname;                                 // Adds new property 'label' to the step for label naming
  this.then(step);                                        // Adds new step by then()
};

/**
 * Goto labeled navigation step
 *
 * @param    String    labelname    Label name for jumping navigation step
 */
 casper.goto = function goto( labelname ) {
  for( var i=0; i<this.steps.length; i++ ){         // Search for label in steps array
      if( this.steps[i].label == labelname ) {      // found?
        this.step = i;                              // new step pointer is set
      }
    }
  };
// End of Extending Casper functions for realizing label() and goto()
//================================================================================
//================================================================================



//================================================================================
//================================================================================
// Extending Casper functions for dumpSteps()

/**
 * Dump Navigation Steps for debugging
 * When you call this function, you cat get current all information about CasperJS Navigation Steps
 * This is compatible with label() and goto() functions already.
 *
 * @param   Boolen   showSource    showing the source code in the navigation step?
 *
 * All step No. display is (steps array index + 1),  in order to accord with logging [info] messages.
 *
 */
 casper.dumpSteps = function dumpSteps( showSource ) {
  this.echo( "=========================== Dump Navigation Steps ==============================", "RED_BAR");
  if( this.current ){ this.echo( "Current step No. = " + (this.current+1) , "INFO"); }
  this.echo( "Next    step No. = " + (this.step+1) , "INFO");
  this.echo( "steps.length = " + this.steps.length , "INFO");
  this.echo( "================================================================================", "WARNING" );

  for( var i=0; i<this.steps.length; i++){
    var step  = this.steps[i];
    var msg   = "Step: " + (i+1) + "/" + this.steps.length + "     level: " + step.level
    if( step.executed ){ msg = msg + "     executed: " + step.executed }
      var color = "PARAMETER";
    if( step.label    ){ color="INFO"; msg = msg + "     label: " + step.label }

    if( i == this.current ) {
      this.echo( msg + "     <====== Current Navigation Step.", "COMMENT");
    } else {
      this.echo( msg, color );
    }
    if( showSource ) {
      this.echo( "--------------------------------------------------------------------------------" );
      this.echo( this.steps[i] );
      this.echo( "================================================================================", "WARNING" );
    }
  }
};

// End of Extending Casper functions for dumpSteps()
//================================================================================
//================================================================================


var config = require('./config');
var fs = require('fs'),
system = require('system');
// Start navigation in casper
casper.start();
casper.echo('Hello!');
//.then(function() {
//    this.echo("Starting, accessing FB...");
//});
// Open FB and login
casper.thenOpen('https://facebook.com', function() {
	if (this.exists('#login_form')) {
		this.echo('Opened FB, now logging in...');
		this.fill('#login_form', {
			'email': config.FB.name,
			'pass' : config.FB.password
		},true);
	}
});

casper.then(function(){
	this.echo('Logged in...');
});

///// ORGANIZING FETCH INFO
var listaObjs = [];
if(config.events && config.events.length > 0)
{
  config.events.map(function(a){
    var obj = { name: a.name, ID: a.ID, type: 'Event' };
    listaObjs.push(obj);
    return obj;
  });
}
if(config.groups && config.groups.length > 0)
{
  config.groups.map(function(a){
    var obj = { name: a.name, ID: a.ID, type: 'Group' };
    listaObjs.push(obj);
    return obj;
  });
}
listaObjs = config.Seed;

casper.then(function(){
  this.echo('Organizing info:');
  this.echo(listaObjs);
});

var iEvt = 0;
var Evento = "EVENTO";
var fetchNext = function(){
	casper.label( "LOOP_START" );            // STEP:  LOOP_START label here:  *** DO NOT put then() around label() for labeling

  this.echo('fetchNext();');
  var evtDaVez = listaObjs[iEvt].ID;
  Evento = listaObjs[iEvt].name;
  this.echo(listaObjs[iEvt].type + ': ' + Evento + ' ID:' + evtDaVez);
  var _evturl = '';
  if(listaObjs[iEvt].type == "Event")
  {
    _evturl = "https://www.facebook.com/browse/event_members/?id="+evtDaVez+"&edge=temporal_groups%3Amember_of_temporal_group";
  }
  else if (listaObjs[iEvt].type == "Group")
  {
    _evturl = "https://www.facebook.com/browse/group_members/?gid="+evtDaVez+"&edge=groups%3Amembers";
  }

  casper.then(function() {             // STEP:  Wait 3 seconds in order not to be considered SPAM
    this.echo("wait 3s, so that i'm not a crawler");
    this.wait( 3*1000 );
  });
 
  casper.thenOpen(_evturl, function() {
  	try{
			//fs.write("ol.html",this.getHTML('html'));
			this.echo('injecting..');
			casper.page.injectJs('jquery.min.js');
			this.echo('injection ok');
		} catch(e) {

		}
	});

	casper.label( "CHECK_START" );            // STEP:  LOOP_START label here:  *** DO NOT put then() around label() for labeling
	var lista;
	// casper.then(function(){
	// 	this.capture('latest.png', undefined, {
 //     format: 'jpg',
 //     quality: 75
 //    });
	// });
	casper.then(function() {
		btn = this.evaluate(function(){
			return document.querySelectorAll('.morePager').length;
		});
		lista = this.evaluate(function(){
			return document.querySelectorAll('.uiProfileBlockContent').length;
		});
		this.echo('so far: '+lista);
		if(btn && btn > 0) {
			this.echo('More Pages available... fetching..');
	 		casper.then(function() {             // STEP:  Click 'Next'
	 			try{
         this.click('.morePager a');
       } catch(ew){
         this.echo('Catch! MissClick!');
         casper.goto( "LOOP_END" );
       }
	            //this.clickLabel('See More', 'a');
              this.wait( 5*1000 );
            });
    } else {
     casper.then(function() {
      casper.echo('No more pages available... ');
      casper.goto( "LOOP_END" );
    });
   }
 });

	casper.then(function() {
    casper.goto( "CHECK_START" );
  });
  casper.label( "LOOP_END" );              // STEP:  LOOP_END label here:   *** DO NOT put then() around label() for labeling
	var listaMails = [];
  casper.then(function() {   
    casper.echo('extracting info!');
    listaMails = this.evaluate(function(){
     return Array.prototype.slice.call(document.querySelectorAll('.uiProfileBlockContent a')).map(function(a,v){
      var aux = a.href.toString();
      aux = aux.split('facebook.com/')[1];
      aux = aux.replace('profile.php?id=','');
      aux = aux.split('?')[0];
      aux = aux.split('&')[0];
      return aux + '@facebook.com'; 
    });
   });
    casper.echo(listaMails.length + ' mails fetched on '+Evento+'.txt');
    fs.write(Evento + ".txt", listaMails);
  });

  casper.echo('should I continue?');
  iEvt++; 
  if(iEvt < listaObjs.length)
  {
    casper.echo("NEXT!");
    casper.goto("LOOP_START");
  }
  else
  {
    casper.echo('bye!')
    casper.exit();
  }

  casper.then(fetchNext);
}
casper.then(fetchNext);

casper.run();
