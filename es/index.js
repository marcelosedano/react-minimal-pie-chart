import React, { Component } from 'react';
import PropTypes from 'prop-types';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var partialCircle = function partialCircle(cx, cy, r, start, end) {
  var length = end - start;
  if (length === 0) return [];
  var fromX = r * Math.cos(start) + cx;
  var fromY = r * Math.sin(start) + cy;
  var toX = r * Math.cos(end) + cx;
  var toY = r * Math.sin(end) + cy;
  var large = Math.abs(length) <= Math.PI ? '0' : '1';
  var sweep = length < 0 ? '0' : '1';
  return [['M', fromX, fromY], ['A', r, r, 0, large, sweep, toX, toY]];
};

var svgPartialCircle = partialCircle;

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}
function evaluateLabelTextAnchor(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      labelPosition = _ref.labelPosition,
      lineWidth = _ref.lineWidth,
      labelHorizontalShift = _ref.labelHorizontalShift;

  // Label in the vertical center
  if (labelHorizontalShift === 0) {
    return 'middle';
  } // Outward label


  if (labelPosition > 100) {
    return labelHorizontalShift > 0 ? 'start' : 'end';
  } // Inward label


  var innerRadius = 100 - lineWidth;

  if (labelPosition < innerRadius) {
    return labelHorizontalShift > 0 ? 'end' : 'start';
  } // Overlying label


  return 'middle';
}
function valueBetween(value, min, max) {
  if (value > max) return max;
  if (value < min) return min;
  return value;
}
function extractPercentage(value, percentage) {
  return value * percentage / 100;
}

function makePathCommands(cx, cy, startAngle, lengthAngle, radius) {
  var patchedLengthAngle = valueBetween(lengthAngle, -359.999, 359.999);
  return svgPartialCircle(cx, cy, // center X and Y
  radius, degreesToRadians(startAngle), degreesToRadians(startAngle + patchedLengthAngle)).map(function (command) {
    return command.join(' ');
  }).join(' ');
}

function ReactMinimalPieChartPath(_ref) {
  var cx = _ref.cx,
      cy = _ref.cy,
      startAngle = _ref.startAngle,
      lengthAngle = _ref.lengthAngle,
      radius = _ref.radius,
      lineWidth = _ref.lineWidth,
      reveal = _ref.reveal,
      title = _ref.title,
      props = _objectWithoutPropertiesLoose(_ref, ["cx", "cy", "startAngle", "lengthAngle", "radius", "lineWidth", "reveal", "title"]);

  var actualRadio = radius - lineWidth / 2;
  var pathCommands = makePathCommands(cx, cy, startAngle, lengthAngle, actualRadio);
  var strokeDasharray;
  var strokeDashoffset; // Animate/hide paths with "stroke-dasharray" + "stroke-dashoffset"
  // https://css-tricks.com/svg-line-animation-works/

  if (typeof reveal === 'number') {
    var pathLength = degreesToRadians(actualRadio) * lengthAngle;
    strokeDasharray = Math.abs(pathLength);
    strokeDashoffset = strokeDasharray - extractPercentage(strokeDasharray, reveal);
  }

  return React.createElement("path", _extends({
    d: pathCommands,
    strokeWidth: lineWidth,
    strokeDasharray: strokeDasharray,
    strokeDashoffset: strokeDashoffset
  }, props), title && React.createElement("title", null, title));
}
ReactMinimalPieChartPath.displayName = 'ReactMinimalPieChartPath';
ReactMinimalPieChartPath.propTypes = {
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  startAngle: PropTypes.number,
  lengthAngle: PropTypes.number,
  radius: PropTypes.number,
  lineWidth: PropTypes.number,
  reveal: PropTypes.number,
  title: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};
ReactMinimalPieChartPath.defaultProps = {
  startAngle: 0,
  lengthAngle: 0,
  lineWidth: 100,
  radius: 100
};

var stylePropType = PropTypes.objectOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]));
var dataPropType = PropTypes.arrayOf(PropTypes.shape({
  title: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  value: PropTypes.number.isRequired,
  color: PropTypes.string,
  key: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  style: stylePropType
}));

function ReactMinimalPieChartLabel(_ref) {
  var data = _ref.data,
      dataIndex = _ref.dataIndex,
      color = _ref.color,
      props = _objectWithoutPropertiesLoose(_ref, ["data", "dataIndex", "color"]);

  return React.createElement("text", _extends({
    textAnchor: "middle",
    dominantBaseline: "middle",
    fill: color
  }, props));
}
ReactMinimalPieChartLabel.displayName = 'ReactMinimalPieChartLabel';
ReactMinimalPieChartLabel.propTypes = {
  data: dataPropType,
  dataIndex: PropTypes.number,
  color: PropTypes.string
};

function extractAbsoluteCoordinates(props) {
  var _props$viewBoxSize = props.viewBoxSize,
      viewBoxWidth = _props$viewBoxSize[0],
      viewBoxHeight = _props$viewBoxSize[1];
  return {
    cx: extractPercentage(props.cx, viewBoxWidth),
    cy: extractPercentage(props.cy, viewBoxHeight),
    radius: extractPercentage(props.radius, viewBoxWidth)
  };
}

function sumValues(data) {
  return data.reduce(function (acc, dataEntry) {
    return acc + dataEntry.value;
  }, 0);
} // Append "percentage", "degrees" and "startOffset" into each data entry


function extendData(_ref) {
  var data = _ref.data,
      totalAngle = _ref.lengthAngle,
      totalValue = _ref.totalValue,
      paddingAngle = _ref.paddingAngle;
  var total = totalValue || sumValues(data);
  var normalizedTotalAngle = valueBetween(totalAngle, -360, 360);
  var numberOfPaddings = Math.abs(normalizedTotalAngle) === 360 ? data.length : data.length - 1;
  var singlePaddingDegrees = Math.abs(paddingAngle) * Math.sign(totalAngle);
  var degreesTakenByPadding = singlePaddingDegrees * numberOfPaddings;
  var degreesTakenByPaths = normalizedTotalAngle - degreesTakenByPadding;
  var lastSegmentEnd = 0; // @NOTE: Shall we evaluate percentage accordingly to dataEntry.value's sign?

  return data.map(function (dataEntry) {
    var valueInPercentage = total === 0 ? 0 : dataEntry.value / total * 100;
    var degrees = extractPercentage(degreesTakenByPaths, valueInPercentage);
    var startOffset = lastSegmentEnd;
    lastSegmentEnd = lastSegmentEnd + degrees + singlePaddingDegrees;
    return _extends({
      percentage: valueInPercentage,
      degrees: degrees,
      startOffset: startOffset
    }, dataEntry);
  });
}

function makeSegmentTransitionStyle(duration, easing, furtherStyles) {
  if (furtherStyles === void 0) {
    furtherStyles = {};
  }

  // Merge CSS transition necessary for chart animation with the ones provided by "segmentsStyle"
  var transition = ["stroke-dashoffset " + duration + "ms " + easing, furtherStyles.transition].filter(Boolean).join(',');
  return {
    transition: transition
  };
}

function renderLabelItem(option, props, value) {
  if (React.isValidElement(option)) {
    return React.cloneElement(option, props);
  }

  var label = value;

  if (typeof option === 'function') {
    label = option(props);

    if (React.isValidElement(label)) {
      return label;
    }
  }

  return React.createElement(ReactMinimalPieChartLabel, props, label);
}

function renderLabels(data, props) {
  var _extractAbsoluteCoord = extractAbsoluteCoordinates(props),
      cx = _extractAbsoluteCoord.cx,
      cy = _extractAbsoluteCoord.cy,
      radius = _extractAbsoluteCoord.radius;

  var labelPosition = extractPercentage(radius, props.labelPosition);
  return data.map(function (dataEntry, index) {
    var startAngle = props.startAngle + dataEntry.startOffset;
    var halfAngle = startAngle + dataEntry.degrees / 2;
    var halfAngleRadians = degreesToRadians(halfAngle);
    var dx = Math.cos(halfAngleRadians) * labelPosition;
    var dy = Math.sin(halfAngleRadians) * labelPosition; // This object is passed as props to the "label" component

    var labelProps = {
      key: "label-" + (dataEntry.key || index),
      x: cx,
      y: cy,
      dx: dx,
      dy: dy,
      textAnchor: evaluateLabelTextAnchor({
        lineWidth: props.lineWidth,
        labelPosition: props.labelPosition,
        labelHorizontalShift: dx
      }),
      data: data,
      dataIndex: index,
      color: dataEntry.color,
      style: props.labelStyle
    };
    return renderLabelItem(props.label, labelProps, dataEntry.value);
  });
}

function renderTitles(data, props) {
  var titlePosition = extractPercentage(props.radius, props.titlePosition);
  return data.map(function (dataEntry, index) {
    var startAngle = props.startAngle + dataEntry.startOffset;
    var halfAngle = startAngle + dataEntry.degrees / 2;
    var halfAngleRadians = degreesToRadians(halfAngle);
    var dx = Math.cos(halfAngleRadians) * titlePosition;
    var dy = Math.sin(halfAngleRadians) * titlePosition; // This object is passed as props to the "title" component

    var titleProps = {
      key: "title-" + (dataEntry.key || index),
      x: props.cx,
      y: props.cy,
      dx: dx,
      dy: dy,
      textAnchor: evaluateLabelTextAnchor({
        lineWidth: props.lineWidth,
        labelPosition: props.titlePosition,
        labelHorizontalShift: dx
      }),
      data: data,
      dataIndex: index,
      color: dataEntry.color,
      style: props.titleStyle
    };
    return (// eslint-disable-next-line react/jsx-key
      React.createElement(ReactMinimalPieChartLabel, titleProps, dataEntry.title)
    );
  });
}

function renderSegments(data, props, hide) {
  var style = props.segmentsStyle;

  if (props.animate) {
    var transitionStyle = makeSegmentTransitionStyle(props.animationDuration, props.animationEasing, style);
    style = Object.assign({}, style, transitionStyle);
  } // Hide/reveal the segment?


  var reveal;

  if (hide === true) {
    reveal = 0;
  } else if (typeof props.reveal === 'number') {
    reveal = props.reveal;
  } else if (hide === false) {
    reveal = 100;
  }

  var _extractAbsoluteCoord2 = extractAbsoluteCoordinates(props),
      cx = _extractAbsoluteCoord2.cx,
      cy = _extractAbsoluteCoord2.cy,
      radius = _extractAbsoluteCoord2.radius;

  var lineWidth = extractPercentage(radius, props.lineWidth);
  var paths = data.map(function (dataEntry, index) {
    var startAngle = props.startAngle + dataEntry.startOffset;
    return React.createElement(ReactMinimalPieChartPath, {
      key: dataEntry.key || index,
      cx: cx,
      cy: cy,
      startAngle: startAngle,
      lengthAngle: dataEntry.degrees,
      radius: radius,
      lineWidth: lineWidth,
      reveal: reveal,
      title: dataEntry.title,
      style: Object.assign({}, style, dataEntry.style),
      stroke: dataEntry.color,
      strokeLinecap: props.rounded ? 'round' : undefined,
      fill: "none",
      onMouseOver: props.onMouseOver && function (e) {
        return props.onMouseOver(e, props.data, index);
      },
      onMouseOut: props.onMouseOut && function (e) {
        return props.onMouseOut(e, props.data, index);
      },
      onClick: props.onClick && function (e) {
        return props.onClick(e, props.data, index);
      }
    });
  });

  if (props.background) {
    paths.unshift(React.createElement(ReactMinimalPieChartPath, {
      key: "bg",
      cx: cx,
      cy: cy,
      startAngle: props.startAngle,
      lengthAngle: props.lengthAngle,
      radius: radius,
      lineWidth: lineWidth,
      stroke: props.background,
      strokeLinecap: props.rounded ? 'round' : undefined,
      fill: "none"
    }));
  }

  return paths;
}

function getVerticalSegmentPositioningStartAngle(data) {
  return 90 - data[0].degrees / 2;
}

function processProps(props, data) {
  var processedProps = props;

  if (props.verticalSegmentPositioning) {
    processedProps = _extends({}, props, {
      startAngle: getVerticalSegmentPositioningStartAngle(data)
    });
  }

  return processedProps;
}

var ReactMinimalPieChart =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(ReactMinimalPieChart, _Component);

  function ReactMinimalPieChart(props) {
    var _this;

    _this = _Component.call(this, props) || this;

    if (props.animate === true) {
      _this.hideSegments = true;
    }

    return _this;
  }

  var _proto = ReactMinimalPieChart.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var _this2 = this;

    if (this.props.animate === true && requestAnimationFrame) {
      this.initialAnimationTimerId = setTimeout(function () {
        _this2.initialAnimationTimerId = null;
        _this2.initialAnimationRAFId = requestAnimationFrame(function () {
          _this2.initialAnimationRAFId = null;

          _this2.startAnimation();
        });
      });
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    if (this.initialAnimationTimerId) {
      clearTimeout(this.initialAnimationTimerId);
    }

    if (this.initialAnimationRAFId) {
      cancelAnimationFrame(this.initialAnimationRAFId);
    }
  };

  _proto.startAnimation = function startAnimation() {
    this.hideSegments = false;
    this.forceUpdate();
  };

  _proto.render = function render() {
    var props = this.props;

    if (props.data === undefined) {
      return null;
    }

    var extendedData = extendData(props);
    props = processProps(props, extendedData);
    return React.createElement("div", {
      className: props.className,
      style: props.style
    }, React.createElement("svg", {
      viewBox: "0 0 " + props.viewBoxSize[0] + " " + props.viewBoxSize[1],
      width: "100%",
      height: "100%",
      style: {
        display: 'block'
      }
    }, renderSegments(extendedData, props, this.hideSegments), props.label && renderLabels(extendedData, props), props.title && renderTitles(extendedData, props), props.injectSvg && props.injectSvg()), props.children);
  };

  return ReactMinimalPieChart;
}(Component);
ReactMinimalPieChart.displayName = 'ReactMinimalPieChart';
ReactMinimalPieChart.propTypes = {
  data: dataPropType,
  cx: PropTypes.number,
  cy: PropTypes.number,
  viewBoxSize: PropTypes.arrayOf(PropTypes.number),
  totalValue: PropTypes.number,
  className: PropTypes.string,
  style: stylePropType,
  segmentsStyle: stylePropType,
  background: PropTypes.string,
  startAngle: PropTypes.number,
  lengthAngle: PropTypes.number,
  paddingAngle: PropTypes.number,
  lineWidth: PropTypes.number,
  radius: PropTypes.number,
  rounded: PropTypes.bool,
  animate: PropTypes.bool,
  animationDuration: PropTypes.number,
  animationEasing: PropTypes.string,
  reveal: PropTypes.number,
  children: PropTypes.node,
  injectSvg: PropTypes.func,
  label: PropTypes.oneOfType([PropTypes.func, PropTypes.element, PropTypes.bool]),
  labelPosition: PropTypes.number,
  labelStyle: stylePropType,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  onClick: PropTypes.func,
  title: PropTypes.bool,
  titlePosition: PropTypes.number,
  titleStyle: stylePropType,
  verticalSegmentPositioning: PropTypes.bool
};
ReactMinimalPieChart.defaultProps = {
  cx: 50,
  cy: 50,
  viewBoxSize: [100, 100],
  startAngle: 0,
  lengthAngle: 360,
  paddingAngle: 0,
  lineWidth: 100,
  radius: 50,
  rounded: false,
  animate: false,
  animationDuration: 500,
  animationEasing: 'ease-out',
  label: false,
  labelPosition: 50,
  onMouseOver: undefined,
  onMouseOut: undefined,
  onClick: undefined,
  title: false,
  titlePosition: 112,
  verticalSegmentPositioning: false
};

export default ReactMinimalPieChart;
//# sourceMappingURL=index.js.map
