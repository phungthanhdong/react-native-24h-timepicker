import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, TouchableOpacity, Text } from "react-native";
import { DateTime } from "luxon";
import {Picker} from '@react-native-picker/picker';
import RBSheet from "react-native-raw-bottom-sheet";
import styles from "./styles";

class TimePicker extends Component {
  constructor(props) {
    super(props);
    __DEV__ &&
        console.log(
          'GOND Warning TimePicker: ', props.selectedTime
        );

    this.state = {
      selectedHourIndex: 0,
      selectedHour: 0,
      selectedMinute: 0,
      selectedSecond: 0,
      hourItems: []
    };
  }

  // Removed
  /*
  static getDerivedStateFromProps(nextProps, prevState) {
    const { selectedHour, selectedMinute, selectedSecond } = nextProps;
    if (
      selectedHour !== prevState.selectedHour ||
      selectedMinute !== prevState.selectedMinute ||
      selectedSecond !== prevState.selectedSecond
    ) {
      return { selectedHour, selectedMinute, selectedSecond };
    }
    return {};
  }
  */

  getHourItems = () => {
    const items = [];
    const { maxHour, hourInterval, hourUnit, datetime } = this.props;
    // const interval = maxHour / hourInterval;
    // for (let i = 0; i <= interval; i++) {
    //   const value = `${i * hourInterval}`;
    //   const item = (
    //     <Picker.Item key={value} value={value} label={value + hourUnit} />
    //   );
    //   items.push(item);
    // }
    // dongpt: Adding DST
    if (!DateTime.isDateTime(datetime)) {
      __DEV__ &&
        console.log(
          'GOND Warning TimePicker datetime is not a valid Luxon object'
        );
      return items;
    }
    
    const selectedDate = datetime.toFormat('yyyyMMdd');
    let hourIterator = datetime.startOf('day');
    let currentDate = hourIterator.toFormat('yyyyMMdd');
    
    do {
      const value = hourIterator.toFormat('HH');
      const item = (
        <Picker.Item key={value} value={value} label={value + hourUnit} />
      );
      items.push(item);
      hourIterator = hourIterator.plus({hour: 1});
      currentDate = hourIterator.toFormat('yyyyMMdd');
      // __DEV__ &&
      //   console.log(
      //     'GOND TimeRuler constructArrayOfHours',
      //     currentDate,
      //     hourIterator
      //   );
    } while (currentDate == selectedDate);

    return items;
  };

  getMinuteItems = () => {
    const items = [];
    const { maxMinute, minuteInterval, minuteUnit } = this.props;
    const interval = maxMinute / minuteInterval;
    for (let i = 0; i <= interval; i++) {
      const value = i * minuteInterval;
      const new_value = value < 10 ? `0${value}` : `${value}`;
      const item = (
        <Picker.Item
          key={value}
          value={new_value}
          label={new_value + minuteUnit}
        />
      );
      items.push(item);
    }
    return items;
  };

  getSecondItems = () => {
    const items = [];
    const { maxSeconds, secondInterval, secondUnit } = this.props;
    const interval = maxSeconds / secondInterval;
    for (let i = 0; i <= interval; i++) {
      const value = i * secondInterval;
      const new_value = value < 10 ? `0${value}` : `${value}`;
      const item = (
        <Picker.Item
          key={value}
          value={new_value}
          label={new_value + secondUnit}
        />
      );
      items.push(item);
    }
    return items;
  };

  onValueChange = (selectedHourIndex, selectedHour, selectedMinute, selectedSecond) => {
    this.setState({selectedHourIndex, selectedHour, selectedMinute, selectedSecond });
  };

  onCancel = () => {
    if (typeof this.props.onCancel === "function") {
      const { selectedHour, selectedMinute, selectedSecond } = this.state;
      this.props.onCancel(selectedHour, selectedMinute, selectedSecond);
    }
  };

  onConfirm = () => {
    if (typeof this.props.onConfirm === "function") {
      const {selectedHourIndex, selectedHour, selectedMinute, selectedSecond } = this.state;
      this.props.onConfirm(selectedHourIndex, selectedHour, selectedMinute, selectedSecond);
    }
  };

  close = () => {
    this.RBSheet.close();
  };

  open = () => {
    const {hour, minute, second} = this.props.selectedTime ?? {
      hour: 0,
      minute: 0,
      second: 0,
    };
    const hourItems = this.getHourItems();
    const selectedHourIndex = hourItems.findIndex(h => h == hour);
    __DEV__ &&
      console.log(
        'GOND TimePicker onOpen: ', hour, minute, second
      );

    this.setState({
      selectedHourIndex,
      selectedHour: hour,
      selectedMinute: minute,
      selectedSecond: second,
      hourItems
    }, () => this.RBSheet.open());
  };

  renderHeader = () => {
    const { textCancel, textConfirm } = this.props;
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={this.onCancel} style={styles.buttonAction}>
          <Text style={[styles.buttonText, styles.buttonTextCancel]}>
            {textCancel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onConfirm} style={styles.buttonAction}>
          <Text style={styles.buttonText}>{textConfirm}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  renderBody = () => {
    const {selectedHourIndex, selectedHour, selectedMinute, selectedSecond, hourItems } = this.state;
    __DEV__ &&
        console.log(
          'GOND TimePicker selected: ', selectedHour, selectedMinute, selectedSecond
        );

    const {showSecond} = this.props;
    return (
      <View style={styles.body}>
        <Picker
          selectedValue={selectedHour}
          style={styles.picker}
          itemStyle={this.props.itemStyle}
          onValueChange={(itemValue, itemIndex) =>
            this.onValueChange(itemIndex, itemValue, selectedMinute, selectedSecond)
          }
        >
          {/* {this.getHourItems()} */}
          {hourItems}
        </Picker>
        <Text style={styles.separator}>:</Text>
        <Picker
          selectedValue={selectedMinute}
          style={styles.picker}
          itemStyle={this.props.itemStyle}
          onValueChange={itemValue =>
            this.onValueChange(selectedHourIndex, selectedHour, itemValue, selectedSecond)
          }
        >
          {this.getMinuteItems()}
        </Picker>
        {showSecond ? <Text style={styles.separator}>:</Text> : null}
        {showSecond ? (
          <Picker
            selectedValue={selectedSecond}
            style={styles.picker}
            itemStyle={this.props.itemStyle}
            onValueChange={itemValue =>
              this.onValueChange(selectedHourIndex, selectedHour, selectedMinute, itemValue)
            }
          >
            {this.getSecondItems()}
          </Picker>
        ) : null}
      </View>
    );
  };

  render() {
    return (
      <RBSheet
        ref={ref => {
          this.RBSheet = ref;
        }}
      >
        {this.renderHeader()}
        {this.renderBody()}
      </RBSheet>
    );
  }
}

TimePicker.propTypes = {
  showSecond: PropTypes.bool,
  maxHour: PropTypes.number,
  maxMinute: PropTypes.number,
  maxSeconds: PropTypes.number,
  hourInterval: PropTypes.number,
  minuteInterval: PropTypes.number,
  secondInterval: PropTypes.number,
  hourUnit: PropTypes.string,
  minuteUnit: PropTypes.string,
  secondUnit: PropTypes.string,
  selectedHour: PropTypes.string,
  selectedMinute: PropTypes.string,
  selectedSecond: PropTypes.string,
  itemStyle: PropTypes.object,
  textCancel: PropTypes.string,
  textConfirm: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func
};

TimePicker.defaultProps = {
  showSecond: true,
  maxHour: 23,
  maxMinute: 59,
  maxSeconds: 59,
  hourInterval: 1,
  minuteInterval: 1,
  secondInterval: 1,
  hourUnit: "",
  minuteUnit: "",
  secondUnit: "",
  selectedHour: "0",
  selectedMinute: "00",
  selectedSecond: "00",
  itemStyle: {},
  textCancel: "Cancel",
  textConfirm: "Done",
  datetime: DateTime.now(),
  onCancel: () => console.log('24h TimePicker: onCancel not set!'),
  onConfirm: () => console.log('24h TimePicker: onConfirm not set!'),
};

export default TimePicker;
