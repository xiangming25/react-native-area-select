import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { window } from './utils'

const rowHeight = 42
const footerEmptyHeight = 34 + 22
class AreaList extends PureComponent {
  static propTypes = {
    areaList: PropTypes.arrayOf(PropTypes.string),
    currentName: PropTypes.string,
    handleSelect: PropTypes.func,
    moduleHeight: PropTypes.number,
  }

  static defaultProps = {
    areaList: [],
    currentName: '',
  }

  render() {
    const { areaList, currentName, moduleHeight } = this.props
    let currnetNameIndex = areaList.findIndex(item => item === currentName)
    currnetNameIndex = currnetNameIndex > -1 ? currnetNameIndex : 0
    return (
      <FlatList
        keyExtractor={item => item}
        style={[styles.selectList, { height: moduleHeight - 88 }]}
        data={areaList}
        initialScrollIndex={currnetNameIndex}
        renderItem={this.renderItem}
        ListFooterComponent={this.renderListFooter}
        onScrollToIndexFailed={() => {}}
        getItemLayout={this.getItemLayout}
      />
    )
  }

  // 配合initialScrollIndex使用，如果不加getItemLayout，可能会导致initialScrollIndex以上的内容显示为空，滑动后才会显示，造成页面会跳动一下问题
  getItemLayout = (data, index) => ({ length: rowHeight, offset: rowHeight * index, index })

  renderItem = ({ item, index }) => {
    const { currentName, handleSelect, activeColor } = this.props
    const isSelect = currentName === item
    return (
      <TouchableOpacity
        key={index}
        style={[styles.row, isSelect && styles.selectRow]}
        onPress={() => handleSelect(item)}
      >
        <Text style={[styles.itemText, isSelect && styles.selectText]}>{item}</Text>
        { isSelect && <Text style={[styles.selectIcon, { color: activeColor }]}>✓</Text> }
      </TouchableOpacity>
    )
  }

  renderListFooter = () => (
    <View style={styles.footerRow} />
  )
}

const styles = StyleSheet.create({
  selectList: {
    flex: 1,
    width: window.width,
    paddingVertical: 11,
    opacity: 1,
    zIndex: 99,
  },
  row: {
    paddingLeft: 26,
    paddingRight: 12,
    height: rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectRow: {
    backgroundColor: '#f5f5f7',
  },
  itemText: {
    fontSize: 14,
    color: '#424244',
  },
  selectText: {
    fontFamily: 'PingFangSC-Semibold',
  },
  selectIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerRow: {
    height: footerEmptyHeight,
  },
})

export default AreaList
