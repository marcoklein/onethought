/* Default start time of timer in milliseconds */
const DEFAULT_START_TIME = 25 * 60 * 1000;
/* How often the timer timeout happens to update time */
const TIMER_UPDATE_INTERVAL = 100;
const DEFAULT_SHORT_BREAK_LENGTH = 5 * 60 * 1000;

Logger.useDefaults();

// import star rating component
Vue.component('star-rating', VueStarRating.default);


// set up vue component
var app = new Vue({
    el: "#app",
    data: {
        time: DEFAULT_START_TIME,
        // length of focus time
        timerDuration: DEFAULT_START_TIME,
        // settings of the app, customizable for the user
        settings: {
            startTime: DEFAULT_START_TIME,
            positiveTimeColor: "inherit",
            negativeTimeColor: "#CC0000",
            allowNegativeTime: true,
            shortBreakLength: DEFAULT_SHORT_BREAK_LENGTH
        },
        
        
        /** Session properties **/
        rating: 0,
        // specified task if any
        task: "",
        sessionDuration: -1,
        reward: "",
        interruptionNote: "",
        
        
        /** States **/
        running: false,
        interruption: false,
        finishOngoing: false,
        finish: false,
        shortBreak: false,
        longBreak: false,
        
        
        
        /** Timer **/
        timerTimeout: null,
        lastTime: 0,
        
        
        
    },
    computed: {
        // compute displayed time text
        timeText: function () {
            // calculate displyed time
            // add a minus in front if time is "negative"
            return this.time < 0 ? "-" + (moment(-this.time + 1000).format("mm:ss")) : moment(this.time).format("mm:ss");
        },
        
        
        /** Styles **/
        
        timeColor: function () {
            return this.time < 0 ? this.settings.negativeTimeColor : this.settings.positiveTimeColor;
        }
    },
    methods: {
        // start or continue an ongoing session
        startSession: function () {
            Logger.info("Starting session.");
            var self = this;
            // cancel interruption if necessary
            self.interruption = false;

            if (self.timerTimeout) {
                // clear timeout if necessary
                clearTimeout(self.timerTimeout);
            }
            // update timer state
            self.running = true;
            self.interruption = false;

            // save time duration to calculate total duration (including "negative" time)
            self.timerDuration = self.time;
            self.lastTime = moment();
            self.timerTimeout = setTimeout(function () {
                self.updateTime();
            }, TIMER_UPDATE_INTERVAL);

        },
            // prepare for a new session
        newSession: function () {
            Logger.info("New session.");
            var self = this;
            self.running = false;
            self.finish = false;
            self.finishOngoing = false;
            self.interruption = false;
            self.shortBreak = false;
            self.longBreak = false;
            self.time = self.settings.startTime;
        },
        // interrupt the ongoing session
        interruptSession: function () {
            Logger.info("Interrupting session.");
            var self = this;
            if (self.running) {
                self.pauseTime();
                self.interruption = true;
            } else {
                Logger.warn("Called interruptTimer but there is no timer running.");
            }
            // focus interruption notes
            $("#interruption-input").focus();
        },
        // finish current session
        finishSession: function () {
            Logger.info("Finish session.");
            var self = this;
            // finish ongoing session?
            if (self.time > 0) {
                self.finishOngoing = true;
            } else { // self.time <= 0
                self.finish = true;
                // pause time
                self.pauseTime();
            }
        },
        saveSession: function () {
            var self = this;
            // store session duration if session is really finished
            self.sessionDuration = self.settings.startTime - self.time;
            Logger.info("Session Duration: " + moment(self.sessionDuration).format("mm:ss"));
            self.startBreak();
        },
        finishOngoingSession: function () {
            var self = this;
            self.finish=true;
            self.finishOngoing=false;
            
            self.pauseTime();
        },
        startBreak: function () {
            Logger.info("Starting break.");
            var self = this;
            // TODO short or long break?
            self.shortBreak = true;
            self.time = self.settings.shortBreakLength;
            self.updateTime();
        },
        // pauses time by clearing the timer timeout
        pauseTime: function () {
            var self = this;
            if (self.timerTimeout) clearTimeout(self.timerTimeout);
            Logger.info("Time Paused.");
        },
        // recursive method to update time after TIMER_UPDATE_INTERVAL milliseconds
        // by using a timeout
        updateTime: function () {
            var self = this;
            // update time text
            self.time -= moment() - self.lastTime;
            self.lastTime = moment();
            
            // if negative time is not allowed stop here
            if ((!self.settings.allowNegativeTime || self.shortBreak || self.longBreak) && self.time < 0) {
                self.time = 0;
                self.running = false;
                if (self.shortBreak || self.longBreak) {
                    // end of break
                    self.pauseTime();
                    self.newSession();
                } else {
                    self.finishSession();
                }
            }
            
            if (self.running) {
                // if still running make new timeout
                self.timerTimeout = setTimeout(function () {
                    self.updateTime();
                }, TIMER_UPDATE_INTERVAL);
            }
        }
    }
});



$(function () {
    
});