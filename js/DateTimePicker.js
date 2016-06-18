//Utility functions
var Utilities = {
  clone: function(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
  },

  toMonthAndYearString: function(date) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[date.getMonth()] + " " + date.getFullYear();
  },

  equals: function(date1, date2) {
    return (date1.getFullYear() === date2.getFullYear()) && (date1.getMonth() === date2.getMonth()) && (date1.getDate() === date2.getDate());
  },

  daysInMonth: function(date) {
    return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  },

  toWeekdayString: function(date) {
    var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return week[date.getDay()];
  },

  dateToString: function(date) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if(date === null)
      return "";
    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  },

  equalMeeting: function(meeting1, meeting2) {
    return (meeting1.startDate === meeting2.startDate) && (meeting1.endDate === meeting2.endDate) && (meeting1.english === meeting2.english);
  },

  makeEnglish(startDate, endDate, comment) {
    moment.locale('meet', {
    calendar : {
        lastDay : '[Yesterday at] LT',
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        lastWeek : '[last] dddd [at] LT',
        nextWeek : 'dddd [at] LT',
        sameElse : 'llll'
    }
    });

    var startMoment = moment(startDate),
    endMoment = moment(endDate);

    if(startDate.getDate() === endDate.getDate())
      return comment + " on " + startMoment.calendar() + " - " + endMoment.format('LT');

    return comment + " from " + startMoment.calendar() + " - " + endMoment.calendar();
  }
};

/*********************************************************/
//DateTimePicker Code

var DateTimePicker = React.createClass({

  getInitialState: function() {
    return{
      startDate: null,
      endDate: null
    };
  },

  makeMeeting: function() {
    this.refs.datePicker.show();
    this.refs.mainMenu.hide();
  },

  showMeetings: function() {
    this.refs.meetingList.initSort();
    this.refs.meetingList.toggle();
  },

  addMeeting: function(sDate, eDate, comm) {
    this.refs.timePicker.hide();

    var meeting = {
      startDate: Utilities.clone(sDate),
      endDate: Utilities.clone(eDate),
      comment: comm
    };
    this.refs.meetingList.addMeeting(meeting);

    this.refs.mainMenu.show();
    this.reset();
  },

  reset: function() {
    this.setState({startDate: null, endDate: null, comment: ""});
    this.refs.timePicker.reset();
    this.refs.datePicker.reset();
  },

  setDates: function(stDate, enDate) {
    var sDate = new Date(stDate.getFullYear(), stDate.getMonth(), stDate.getDate()),
    eDate = new Date(enDate.getFullYear(), enDate.getMonth(), enDate.getDate());

    this.setState({startDate: sDate, endDate: eDate});

    this.refs.datePicker.hide();
    this.refs.timePicker.show();
  },

  closeDatePicker: function() {
    this.refs.datePicker.hide();
    this.refs.mainMenu.show();
  },

  render: function() {
    return React.createElement("div", {className: "date-time-picker"},
    React.createElement(MainMenu, {ref: "mainMenu", makeMeeting: this.makeMeeting, showMeetings: this.showMeetings}),
    React.createElement(DatePicker, {ref: "datePicker", startDate: null, endDate: null, setDates: this.setDates, closeDatePicker: this.closeDatePicker}),
    React.createElement(TimePicker, {ref: "timePicker", startDate: this.state.startDate, endDate: this.state.endDate, addMeeting: this.addMeeting}),
    React.createElement(MeetingList, {ref: "meetingList"})
  );
  }
});

var MainMenu = React.createClass({
  getInitialState: function() {
    return {
      isDisabled: false,
      meetingMessage: "Show Meetings.",
      shouldHide: false
    };
  },

  show: function() {
    this.setState({shouldHide: false});
  },

  hide: function() {
    this.setState({shouldHide: true});
  },

  showMeetings: function() {
    this.props.showMeetings();
    var message = this.state.isDisabled ? "Hide Meetings." : "Show Meetings.";
    this.setState({meetingMessage: message, isDisabled: !this.state.isDisabled});
  },

  render: function() {
    if(this.state.shouldHide) return null;

    return React.createElement("div", {className: "meeting-menu"},
    React.createElement("button", {className: "make-buton", disabled: this.state.isDisabled, onClick: this.props.makeMeeting}, "Make a Meeting."),
    React.createElement("button", {className: "show-meetings-buton", onClick: this.showMeetings}, this.state.isDisabled ? "Hide Meetings." : "Show Meetings.")
    );
  }
});

var MeetingList = React.createClass({
  getInitialState: function() {
    return {
      meetings: [],
      shouldHide: true
    }
  },

  toggle: function() {
    this.setState({shouldHide: !this.state.shouldHide});
  },

  addMeeting: function(meeting) {
    this.setState({meetings: this.state.meetings.concat([meeting])});
  },

  delete: function(meeting) {
    this.setState({meetings: this.state.meetings.filter(function(i) {
      return !Utilities.equalMeeting(i, meeting);
    })});
  },

  initSort: function() {
    this.setState({meetings: this.state.meetings.sort(this.compareStartDate)});
  },

  compareStartDate: function(a,b) {
  if (a.startDate < b.startDate)
    return -1;
  else if (a.startDate > b.startDate)
    return 1;
  else
    return 0;
  },

  compareEndDate: function(a,b) {
  if (a.endDate < b.endDate)
    return -1;
  else if (a.endDate > b.endDate)
    return 1;
  else
    return 0;
  },

  compareComment: function(a,b) {
  if (a.comment < b.comment)
    return -1;
  else if (a.comment > b.comment)
    return 1;
  else
    return 0;
  },

  changeSort: function() {
    if(document.getElementById("sort-menu").value === "Start Date"){
      this.setState({meetings: this.state.meetings.sort(this.compareStartDate)});
    } else if(document.getElementById("sort-menu").value === "End Date"){
      this.setState({meetings: this.state.meetings.sort(this.compareEndDate)});
    } else if(document.getElementById("sort-menu").value === "Comment"){
      this.setState({meetings: this.state.meetings.sort(this.compareComment)});
    }
  },

  render: function() {
    if(this.state.shouldHide) return null;

    return React.createElement("div", {className: "meeting-list"},
    React.createElement("span", null, "Sort by: "),
    React.createElement("select", {onChange: this.changeSort, id: "sort-menu", class: "sort-menu", className: "sort-menu"},
      React.createElement("option", {href: "#"}, "Start Date"),
      React.createElement("option", {href: "#"}, "End Date"),
      React.createElement("option", {href: "#"}, "Comment")
    ),

    React.createElement("fieldset", {className: "meeting-area"},
    this.state.meetings.map( function(meeting, i) {
      return React.createElement("div", {className:"meeting"},
      React.createElement("span", {className:"meeting-label"}, Utilities.makeEnglish(meeting.startDate, meeting.endDate, meeting.comment)),
      React.createElement("button", {className: "delete-button", onClick: this.delete.bind(null, meeting)}, "Delete")
      )
    }.bind(this))
    )
    );
  }
});

/*********************************************************/
//TimePicker Code

var TimePicker = React.createClass({
  getInitialState: function() {
    var date = new Date(),
    initHour = date.getHours() % 12;

    if(initHour === 0) initHour = 12;

    return {
      startHour: initHour,
      startMinute: date.getMinutes(),
      startMeridiem: date.getHours() < 12 ? false : true,
      endHour: initHour,
      endMinute: date.getMinutes(),
      endMeridiem: date.getHours() < 12 ? false : true,
      comment: "Meeting",
      shouldHide: true
    }
  },

  reset: function() {
    var date = new Date(),
    initHour = date.getHours() % 12;

    if(initHour === 0) initHour = 12;

    this.setState({
      startHour: initHour,
      startMinute: date.getMinutes(),
      startMeridiem: date.getHours() < 12 ? false : true,
      endHour: initHour,
      endMinute: date.getMinutes(),
      endMeridiem: date.getHours() < 12 ? false : true,
      comment: "Meeting"
    });
  },

  setStartHour: function(hour) {
    this.setState({startHour: hour});
  },

  setStartMinute: function(minute) {
    this.setState({startMinute: minute});
  },

  setStartMeridiem: function(meridiem) {
    this.setState({startMeridiem: meridiem});
  },

  setEndHour: function(hour) {
    this.setState({endHour: hour});
  },

  setEndMinute: function(minute) {
    this.setState({endMinute: minute});
  },

  setEndMeridiem: function(meridiem) {
    this.setState({endMeridiem: meridiem});
  },

  handleTextChange: function(e) {
    this.setState({comment: e.target.value});
  },

  show: function() {
    this.setState({shouldHide: false});
  },

  hide: function() {
    this.setState({shouldHide: true});
  },

  makeMeeting() {
    var warning = "";

    if(this.state.startHour === null || this.state.startMinute === null || this.state.startMeridiem === null)
      warning += "* Need to enter start time.\n";
    if(this.state.endHour === null || this.state.endMinute === null || this.state.endMeridiem === null)
      warning += "* Need to enter end time.";

    if(warning !== ""){
      alert(warning);
      return;
    }

    var sHour, eHour;

    if(this.state.startHour === 12) {
      if(this.state.startMeridiem) sHour = 12;
      else sHour = 0;
    } else {
      sHour = this.state.startHour + (this.state.startMeridiem? 12 : 0);
    }

    if(this.state.endHour === 12) {
      if(this.state.endMeridiem) eHour = 12;
      else eHour = 0;
    } else {
      eHour = this.state.endHour + (this.state.endMeridiem? 12 : 0);
    }

    var sDate = new Date(this.props.startDate.getFullYear(), this.props.startDate.getMonth(), this.props.startDate.getDate(), sHour, this.state.startMinute),
    eDate = new Date(this.props.endDate.getFullYear(), this.props.endDate.getMonth(), this.props.endDate.getDate(), eHour, this.state.endMinute);

    if(sDate > eDate){
      alert("* Start time cannot begin after end time.");
      return;
    }

    this.props.addMeeting(sDate, eDate, this.state.comment);
    alert(Utilities.makeEnglish(sDate, eDate, this.state.comment));
  },

  render: function() {
    if(this.state.shouldHide) return null;

    var startMoment = moment(new Date(this.props.startDate.getFullYear(), this.props.startDate.getMonth(), this.props.startDate.getDate())),
    endMoment = moment(new Date(this.props.endDate.getFullYear(), this.props.endDate.getMonth(), this.props.endDate.getDate()));

    return React.createElement("div", {className: "time-picker"},
    React.createElement("span", {className: "start-time-label"}, "Enter Start Time:  "),
    React.createElement("span", {className: "start-date-time-label"}, startMoment.format('LL') + " at "),
    React.createElement(StartClock, {hour: this.state.startHour, minute: this.state.startMinute, meridiem: this.state.startMeridiem, setHour: this.setStartHour, setMinute: this.setStartMinute, setMeridiem: this.setStartMeridiem}),
    React.createElement("br", null),
    React.createElement("span", {className: "end-time-label"}, "Enter End Time  :  "),
    React.createElement("span", {className: "end-date-time-label"}, endMoment.format('LL') + " at "),
    React.createElement(EndClock, {hour: this.state.endHour, minute: this.state.endMinute, meridiem: this.state.endMeridiem, setHour: this.setEndHour, setMinute: this.setEndMinute, setMeridiem: this.setEndMeridiem}),
    React.createElement("br", null),
    React.createElement("span", null, "Enter Comment   :  "),
    React.createElement("input", {type: "text", value: this.state.comment, onChange: this.handleTextChange}),
    React.createElement("br", null),
    React.createElement("button", {onClick: this.makeMeeting}, "Make Meeting!")
  );
}
});

var StartClock = React.createClass({
  render: function() {
    return React.createElement(Clock, {prefix: "start", classId: "start-clock", hour: this.props.hour, minute: this.props.minute, meridiem: this.props.meridiem, setHour: this.props.setHour, setMinute: this.props.setMinute, setMeridiem: this.props.setMeridiem});
  }
});

var EndClock = React.createClass({
  render: function() {
    return React.createElement(Clock, {prefix: "end", classId: "end-clock", hour: this.props.hour, minute: this.props.minute, meridiem: this.props.meridiem, setHour: this.props.setHour, setMinute: this.props.setMinute, setMeridiem: this.props.setMeridiem});
  }
});


var Clock = React.createClass({

  getInitialState: function() {
    return {
      hour: this.props.hour,
      minuteTen: Math.floor(this.props.minute/10),
      minuteOne: this.props.minute%10,
      meridiem: this.props.meridiem,
      zone: ""
    }
  },

  changeHour: function(isUp) {
    var newHour = this.state.hour;
    if(isUp) {
      if(newHour === 12) newHour = 1;
      else newHour += 1;
    }
    else if(!isUp) {
      if(newHour === 1) newHour = 12;
      else newHour -= 1;
    }
    this.setState({hour: newHour});
    this.props.setHour(newHour);
  },

  changeMinuteTen: function(isUp) {
    var newMinuteTen = this.state.minuteTen;
    if(isUp){
        if(newMinuteTen === 5) newMinuteTen = 0;
        else newMinuteTen += 1;
    }
    else if(!isUp){
      if(newMinuteTen === 0) newMinuteTen = 5;
      else newMinuteTen -= 1;
    }

    this.setState({minuteTen: newMinuteTen});
    this.props.setMinute(newMinuteTen + this.state.minuteOne);
  },

  changeMinuteOne: function(isUp) {
    var newMinuteOne = this.state.minuteOne;
    if(isUp){
        if(newMinuteOne === 9) newMinuteOne = 0;
        else newMinuteOne += 1;
    }
    else if(!isUp){
      if(newMinuteOne === 0) newMinuteOne = 9;
      else newMinuteOne -= 1;
    }

    this.setState({minuteOne: newMinuteOne});
    this.props.setMinute(this.state.minuteTen + newMinuteOne);
  },

  changeMeridiem: function() {
    var newMeridiem = !this.state.meridiem;
    this.setState({meridiem: newMeridiem});
    this.props.setMeridiem(newMeridiem);
  },

  render: function() {
    return React.createElement("div", {className: "clock"},

    React.createElement("div", {className: "hour-menu"},
    React.createElement("button", {onClick: this.changeHour.bind(null, true), className: "hour-up"}, "^"),
    React.createElement("div", {id: this.props.prefix+"-hour-display", className: "hour-display"}, this.state.hour),
    React.createElement("button", {onClick: this.changeHour.bind(null, false), className: "hour-down"}, "v")
    ),

    React.createElement("span", {className: "separator"}, " : "),

    React.createElement("div", {className: "minute-ten-menu"},
    React.createElement("button", {onClick: this.changeMinuteTen.bind(null, true), className: "minute-ten-up"}, "^"),
    React.createElement("div", {id: this.props.prefix+"-minute-ten-display", className: "minute-ten-display"}, this.state.minuteTen),
    React.createElement("button", {onClick: this.changeMinuteTen.bind(null, false), className: "minute-ten-down"}, "v")
    ),

    React.createElement("div", {className: "minute-one-menu"},
    React.createElement("button", {onClick: this.changeMinuteOne.bind(null, true), className: "minute-one-up"}, "^"),
    React.createElement("div", {id: this.props.prefix+"-minute-one-display", className: "minute-one-display"}, this.state.minuteOne),
    React.createElement("button", {onClick: this.changeMinuteOne.bind(null, false), className: "minute-one-down"}, "v")
    ),

    React.createElement("div", {className: "meridiem-menu"},
    React.createElement("button", {onClick: this.changeMeridiem, className: "meridiem-up"}, "^"),
    React.createElement("div", {id: this.props.prefix+"-meridiem-display", className: "meridiem-display"}, this.state.meridiem ? "pm" : "am"),
    React.createElement("button", {onClick: this.changeMeridiem, className: "meridiem-down"}, "v")
    )
  );
  }
});


/*********************************************************/
//DatePicker Code

var DatePicker = React.createClass({

  getInitialState: function() {
    return {
      current: new Date(),
      selected: null,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      shouldHide: true
    };
  },

  reset: function() {
    this.setState({selected: null,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
    });
  },

  show: function() {
    this.setState({shouldHide: false});
  },

  hide: function() {
    this.setState({shouldHide: true});
  },

  onSelect: function(date) {
    if(this.state.selected !== null && Utilities.equals(date, this.state.selected)) {
      if(this.state.startDate === null) {
        this.setState({startDate: date, selected: null});
      } else {
        if(date >= this.state.startDate)
          this.setState({endDate: date});
      }
    } else
    this.setState({selected: date});
  },

  setDates: function() {
    if(this.state.startDate !== null && this.state.endDate !== null)
      this.props.setDates(this.state.startDate, this.state.endDate);
  },

  getInstructionText: function() {
    if(this.state.startDate === null)
      return "Set Start Date.";
    if(this.state.endDate === null)
      return "Set End Date.";
    return "Set Start and End Times.";
  },

  getUndoText: function() {
    if(this.state.startDate === null)
      return "Close.";
    if(this.state.endDate === null)
      return "Undo Start Date.";
    return "Undo End Date.";
  },

  undo: function() {
    if(this.state.startDate === null){
      this.props.closeDatePicker();
    } else if(this.state.endDate === null) {
      this.setState({startDate: null, selected: null});
    } else {
      this.setState({endDate: null, selected: null});
    }
  },

  render: function() {
    if(this.state.shouldHide) return null;

    return React.createElement("div", {className: "date-picker"},
    React.createElement(Calendar, {ref: "calendar", current: this.state.current, selected: this.state.selected, startDate: this.state.startDate, endDate: this.state.endDate, onSelect: this.onSelect, onMove: this.onMove}),
    React.createElement("span", {className: "instruction-label"}, this.getInstructionText()),
    React.createElement("button", {className: "undo-button", onClick: this.undo}, this.getUndoText()),
    React.createElement("button", {className: "next-button", onClick: this.setDates}, "Choose Times."),
    React.createElement("span", {className: "start-date-label"}, "Start Date: "+Utilities.dateToString(this.state.startDate)),
    React.createElement("span", {className: "end-date-label"}, "End Date  : "+Utilities.dateToString(this.state.endDate))
  );
}

});

var Calendar = React.createClass({

  getInitialState: function() {
    return {
      view: new Date()
    };
  },

  onMove: function(date) {
    this.setState({view: Utilities.clone(date)});

    this.refs.monthHeader.enable();
  },

  render: function() {
    return React.createElement("div", {className: "calendar"},
    React.createElement(MonthHeader, {ref: "monthHeader", view: this.state.view, onMove: this.onMove}),
    React.createElement(WeekHeader, null),
    React.createElement(Grid, {view: this.state.view, selected: this.props.selected, current: this.props.current, startDate: this.props.startDate, endDate: this.props.endDate, onSelect: this.props.onSelect, onMove: this.onMove})
  );
}
});

var MonthHeader = React.createClass({

  getInitialState: function() {
    return {
      view: Utilities.clone(this.props.view),
      enabled: true
    }
  },

  moveBackward: function() {
    if(!this.state.enabled)
    return;

    var v = Utilities.clone(this.state.view);
    v.setMonth(v.getMonth() - 1);

    this.setState({
      view: v,
      enabled: false
    });

    this.props.onMove(Utilities.clone(v));
  },

  moveForward: function() {
    if(!this.state.enabled)
    return;

    var v = Utilities.clone(this.state.view);
    v.setMonth(v.getMonth() + 1);

    this.setState({
      view: v,
      enabled: false
    });

    this.props.onMove(Utilities.clone(v));
  },

  enable: function() {
    this.setState({enabled: true});
  },

  render: function() {
    return React.createElement("div", {className: "month-header"},
    React.createElement("i", {className: (this.state.enabled ? "" : " disabled"), onClick: this.moveBackward}, "<"),
    React.createElement("span", null, Utilities.toMonthAndYearString(this.state.view)),
    React.createElement("i", {className: (this.state.enabled ? "" : " disabled"), onClick: this.moveForward}, ">")
  );
}
});

var WeekHeader = React.createClass({
  render: function() {
    return React.createElement("div",{className: "week-header"},
    React.createElement("span", null, "Sunday"),
    React.createElement("span", null, "Monday"),
    React.createElement("span", null, "Tuesday"),
    React.createElement("span", null, "Wednesday"),
    React.createElement("span", null, "Thursday"),
    React.createElement("span", null, "Friday"),
    React.createElement("span", null, "Saturday")
  );
}
});

var Grid = React.createClass({

  makeWeekStarts: function(date) {
    var start = Utilities.clone(date);
    start.setDate(1);
    while(start.getDay() !== 0) {
      start.setDate(start.getDate() - 1);
    }

    var starts = [Utilities.clone(start)];

    start.setDate(start.getDate() + 7);
    var current = start,
    month = current.getMonth();

    while(current.getMonth() === month){
      starts.push(Utilities.clone(current));
      current.setDate(current.getDate() + 7);
    }

    return starts;
  },

  makeWeeks: function(date) {
    var starts = this.makeWeekStarts(date);

    return starts.map(function(week, i) {
      return React.createElement(Row, {key: i, start: week, view: this.props.view, selected: this.props.selected, current: this.props.current, startDate: this.props.startDate, endDate: this.props.endDate, onSelect: this.props.onSelect})
    }.bind(this))
  },

  render: function() {
    return React.createElement("div", {className: "grid"},
    React.createElement("div", {ref: "current"},
    this.makeWeeks(this.props.view)
  )
);
}
});

var Row = React.createClass({
  makeWeek: function(start) {
    var week = [Utilities.clone(start)],
    current = Utilities.clone(start);

    for(var i = 0; i < 6; i++) {
      current = Utilities.clone(current);
      current.setDate(current.getDate() + 1);
      week.push(current);
    }

    return week;
  },

  makeClassName: function(day){
    var className = "day";
    if (Utilities.equals(day, this.props.current))
    className += " today";
    if (this.props.view.getMonth() !== day.getMonth())
    className += " other-month";
    if (this.props.selected !== null && (Utilities.equals(day, this.props.selected)))
    className += " selected";
    if (this.props.startDate !== null && (Utilities.equals(day, this.props.startDate)))
    className += " start"
    if (this.props.endDate !== null && (Utilities.equals(day, this.props.endDate)))
    className += " end"
    return className;
  },

  onSelect: function(day) {
    if(this.props.view.getMonth() === day.getMonth())
      this.props.onSelect(day);
  },

  render: function() {
    var week = this.makeWeek(this.props.start);
    return React.createElement("div", {className: "row"},
    week.map(function(day, i) {
      return React.createElement("div", {key: i, onClick: this.onSelect.bind(null, day), className: this.makeClassName(day)}, day.getDate())
    }.bind(this))
  );
}
});

ReactDOM.render(
  <DateTimePicker />,
  document.getElementById('content')
);
