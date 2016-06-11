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

    console.log(this.state.startDate+" "+this.state.endDate+" "+this.state.comment);

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
    React.createElement("button", {className: "show-meetings-buton", onClick: this.showMeetings}, "Show Meetings.")
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
      React.createElement("span", null, Utilities.makeEnglish(meeting.startDate, meeting.endDate, meeting.comment)),
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
    return {
      startHour: null,
      startMinute: null,
      startMeridiem: null,
      endHour: null,
      endMinute: null,
      endMeridiem: null,
      comment: "Meeting",
      shouldHide: true
    }
  },

  reset: function() {
    this.setState({
      startHour: null,
      startMinute: null,
      startMeridiem: null,
      endHour: null,
      endMinute: null,
      endMeridiem: null,
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

    var sHour = this.state.startHour + (this.state.startMeridiem ? 12 : 0),
    eHour = this.state.endHour + (this.state.endMeridiem ? 12 : 0);

    var sDate = new Date(this.props.startDate.getFullYear(), this.props.startDate.getMonth(), this.props.startDate.getDate(), sHour, this.state.startMinute),
    eDate = new Date(this.props.endDate.getFullYear(), this.props.endDate.getMonth(), this.props.endDate.getDate(), eHour, this.state.endMinute);

    console.log("start date: "+sDate);
    console.log("end date: "+eDate);

    if(sDate > eDate){
      alert("* Start time cannot begin after end time.");
      return;
    }

    this.props.addMeeting(sDate, eDate, this.state.comment);
    alert(Utilities.makeEnglish(sDate, eDate, this.state.comment));
  },

  render: function() {
    if(this.state.shouldHide) return null;

    return React.createElement("div", {className: "time-picker"},
    React.createElement("span", null, "Enter Start Time:  "),
    React.createElement(StartClock, {setHour: this.setStartHour, setMinute: this.setStartMinute, setMeridiem: this.setStartMeridiem}),
    React.createElement("br", null),
    React.createElement("span", null, "Enter End Time  :  "),
    React.createElement(EndClock, {setHour: this.setEndHour, setMinute: this.setEndMinute, setMeridiem: this.setEndMeridiem}),
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
    return React.createElement(Clock, {prefix: "start", classId: "start-clock", setHour: this.props.setHour, setMinute: this.props.setMinute, setMeridiem: this.props.setMeridiem});
  }
});

var EndClock = React.createClass({
  render: function() {
    return React.createElement(Clock, {prefix: "end", classId: "end-clock", setHour: this.props.setHour, setMinute: this.props.setMinute, setMeridiem: this.props.setMeridiem});
  }
});


var Clock = React.createClass({

  getInitialState: function() {
    return {
      hour: null,
      minute: null,
      meridiem: null,
      zone: ""
    }
  },

  changeHour: function() {
    if(this.state.hour === null)
      document.getElementById(this.props.prefix+"-hour-menu").remove(0);
    this.setState({hour: parseInt(document.getElementById(this.props.prefix+"-hour-menu").value)});
    this.props.setHour(parseInt(document.getElementById(this.props.prefix+"-hour-menu").value));
  },

  changeMinute: function() {
    if(this.state.minute === null)
      document.getElementById(this.props.prefix+"-minute-menu").remove(0);
    this.setState({minute: parseInt(document.getElementById(this.props.prefix+"-minute-menu").value)});
    this.props.setMinute(parseInt(document.getElementById(this.props.prefix+"-minute-menu").value));
  },

  changeMeridiem: function() {
    if(this.state.meridiem === null)
      document.getElementById(this.props.prefix+"-meridiem-menu").remove(0);
    this.setState({meridiem: (document.getElementById(this.props.prefix+"-meridiem-menu").value === "pm")});
    this.props.setMeridiem(document.getElementById(this.props.prefix+"-meridiem-menu").value === "pm");
  },

  render: function() {
    var date = new Date();
    var minutes = Array.apply(null, {length: 60}).map(Number.call, Number);
    var minuteString = this.state.minute < 10 ? "0" + this.state.minute : this.state.minute.toString();

    return React.createElement("div", {className: "clock"},
    React.createElement("select", {onChange: this.changeHour, id: this.props.prefix+"-hour-menu", class: "hour-menu", className: "hour-menu"},
      React.createElement("option", {selected: "selected"}, "hour"),
      React.createElement("option", {href: "#"}, "1"),
      React.createElement("option", {href: "#"}, "2"),
      React.createElement("option", {href: "#"}, "3"),
      React.createElement("option", {href: "#"}, "4"),
      React.createElement("option", {href: "#"}, "5"),
      React.createElement("option", {href: "#"}, "6"),
      React.createElement("option", {href: "#"}, "7"),
      React.createElement("option", {href: "#"}, "8"),
      React.createElement("option", {href: "#"}, "9"),
      React.createElement("option", {href: "#"}, "10"),
      React.createElement("option", {href: "#"}, "11"),
      React.createElement("option", {href: "#"}, "12")
    ),

    React.createElement("span", null, " : "),

    React.createElement("select", {onChange: this.changeMinute, id: this.props.prefix+"-minute-menu", class: "minute-menu", className: "minute-menu"},
    React.createElement("option", {selected: "selected"}, "minute"),
    minutes.map(function(num, i) {
      return React.createElement("option", {key: i, href: "#"}, (num >= 10) ? num.toString() : "0"+num)
    }.bind(this))
    ),

    React.createElement("span", null, " "),

    React.createElement("select", {onChange: this.changeMeridiem, id: this.props.prefix+"-meridiem-menu", class: "meridiem-menu", className: "meridiem-menu"},
      React.createElement("option", {selected: "selected"}, "am/pm"),
      React.createElement("option", {href: "#"}, "am"),
      React.createElement("option", {href: "#"}, "pm")
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
    if(this.props.current <= day && this.props.view.getMonth() === day.getMonth())
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
