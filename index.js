/**
 * 地址选择器组件
 * 数据参考地址
 * https://download.csdn.net/download/qq_20343517/10437301?utm_source=bbsseo
 * https://github.com/modood/Administrative-divisions-of-China
 */
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import areaConfig from './areaConfig'
import AreaList from './AreaList'
import { window, onePt } from './utils'

const activityLineWidth = 36
const oneItemWidth = window.width / 4

class index extends PureComponent {
  static propTypes = {
    place: PropTypes.string.isRequired,
    handleSelectSuccess: PropTypes.func.isRequired,
    initShow: PropTypes.bool,
  }

  static defaultProps = {
    initShow: false,
    place: '',
  }

  constructor(props) {
    super(props)

    const { initShow } = props

    this.citys = {}
    this.districts = {}
    this.towns = {}

    const areaData = this.initAreaData()
    const currentSelectIndex = this.initCurrentIndex(areaData)

    this.state = {
      areaData,
      currentSelectIndex,
      containerBottom: initShow ? 0 : -window.height,
    }
  }

  render() {
    const { containerBottom } = this.state
    return (
      <View style={[styles.container, { bottom: containerBottom }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={this.hide} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>所在地区</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={this.hide}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          { this.renderTabs() }
          { this.renderContent() }
        </View>
      </View>
    )
  }

  renderTabs = () => {
    const { currentSelectIndex } = this.state
    // 计算选中tab下划线的位置
    const activityLineLeft = ((oneItemWidth - activityLineWidth) / 2)
          + (oneItemWidth * currentSelectIndex)
    const notEmptyAreaData = this.getSelectedAreaData()
    return (
      <View style={styles.tabs}>
        {
          notEmptyAreaData.map((item, index) => {
            const { selectName } = item
            const isActivity = currentSelectIndex === index
            return (
              <TouchableOpacity
                key={index}
                style={[styles.tab, { width: oneItemWidth }]}
                onPress={() => { this.handleTab(index) }}
              >
                <Text style={[styles.tabText, isActivity && styles.tabTextActivity]} numberOfLines={1}>
                  { selectName || '请选择' }
                </Text>
              </TouchableOpacity>
            )
          })
        }
        <View style={[styles.activityLine, { left: activityLineLeft }]} />
      </View>
    )
  }

  // 获取已经选择过的地区数据
  getSelectedAreaData = () => {
    const { areaData } = this.state
    const notEmptyAreaData = areaData.filter(item => Boolean(item.selectName))
    const hasChildList = notEmptyAreaData.length
      && notEmptyAreaData.length < areaData.length
      && areaData[notEmptyAreaData.length].list.length > 0
    if (hasChildList) {
      notEmptyAreaData.push(areaData[notEmptyAreaData.length])
    } else if (notEmptyAreaData.length === 0) {
      notEmptyAreaData.push(areaData[0])
    }
    return notEmptyAreaData
  }

  handleTab = tabIndex => {
    this.setState({ currentSelectIndex: tabIndex })
    this.contentRef && this.contentRef.scrollToIndex({ index: tabIndex, animated: false })
  }

  renderContent = () => {
    const { areaData, currentSelectIndex } = this.state
    return (
      <FlatList
        style={styles.allList}
        ref={refs => (this.contentRef = refs)}
        horizontal
        scrollEnabled={false}
        keyExtractor={item => item.name}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={currentSelectIndex}
        data={areaData}
        renderItem={this.renderItem}
        getItemLayout={this.getItemLayout}
      />
    )
  }

  getItemLayout = (data, index) => ({ length: window.width, offset: window.width * index, index })

  renderItem = ({ item, index }) => {
    const { name, selectName, list } = item
    return (
      <AreaList
        key={index}
        areaList={list}
        currentName={selectName}
        handleSelect={currentName => this.handleSelect(currentName, name, index)}
      />
    )
  }

  handleSelect = (currentName, name, currentIndex) => {
    const { areaData } = this.state
    const { handleSelectSuccess } = this.props
    const newList = this.getNewList(currentName, currentIndex)

    const newAreaData = areaData.map((item, index) => {
      let selectName = item.selectName
      let list = item.list
      if (index === currentIndex) {
        selectName = currentName
      } else if (index > currentIndex) {
        selectName = ''
        list = index === currentIndex + 1 ? newList : []
      }
      return { ...item, selectName, list }
    })
    const hasChildList = newList.length > 0
    const newIndex = (currentIndex < areaData.length - 1 && hasChildList)
      ? currentIndex + 1
      : currentIndex
    this.setState({
      areaData: newAreaData,
      currentSelectIndex: newIndex,
    })
    this.contentRef && this.contentRef.scrollToIndex({ index: newIndex, animated: false })
    if (!hasChildList) {
      const areaArr = newAreaData.filter(item => Boolean(item.selectName))
        .map(item => item.selectName)
      handleSelectSuccess(areaArr)
      this.hide()
    }
  }

  getNewList = (currentName, currentIndex) => {
    let newList = []
    switch (currentIndex) {
      case 0:
        newList = this.getCityList(currentName)
        break
      case 1:
        newList = this.getDistrictList(currentName)
        break
      case 2:
        newList = this.getTownList(currentName)
        break
      default:
        newList = []
    }
    return newList
  }

  show = () => {
    this.setState({ containerBottom: 0 })
  }

  hide = () => {
    this.setState({ containerBottom: -window.height })
  }

  // 初始化地区数据
  initAreaData = () => {
    const { place } = this.props
    const placeArr = place.split(' ').filter(item => Boolean(item))
    const [country, city, district, town] = placeArr

    const countryList = this.getCountryList()
    const cityList = Boolean(country) ? this.getCityList(country) : []
    const districtList = Boolean(city) ? this.getDistrictList(city) : []
    const townList = Boolean(district) ? this.getTownList(district) : []

    const areaData = [{
      name: 'country',
      selectName: countryList.find(item => item === country) ? country : null,    // 多加一级find操作，防止中间因数据源不统一，导致查询失败问题
      list: countryList,
    }, {
      name: 'city',
      selectName: cityList.length > 0 && cityList.find(item => item === city) ? city : null,
      list: cityList,
    }, {
      name: 'district',
      selectName: districtList.length > 0 && districtList.find(item => item === district)
        ? district
        : null,
      list: districtList,
    }, {
      name: 'town',
      selectName: townList.length > 0 && townList.find(item => item === town) ? town : null,
      list: townList,
    }]

    return areaData
  }

  // 初始化被选中的列
  initCurrentIndex = areaData => {
    let currentSelectIndex = 0
    const areaNotEmpty = areaData.filter(item => item.selectName)

    if (areaNotEmpty.length > 0 && areaNotEmpty.length < 4) {
      currentSelectIndex = areaNotEmpty.length
    } else if (areaNotEmpty.length === 4) {
      currentSelectIndex = areaNotEmpty.length - 1
    }

    return currentSelectIndex
  }

  getCountryList = () => Object.keys(areaConfig)

  getCityList = country => {
    this.citys = areaConfig[country] || {}
    return Object.keys(this.citys) || []
  }

  getDistrictList = city => {
    this.districts = this.citys[city] || {}
    return Object.keys(this.districts) || []
  }

  getTownList = district => (this.districts[district] || [])
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: window.width,
    height: window.height,
    backgroundColor: '#28282a66',
    zIndex: 999,
    justifyContent: 'flex-end',
  },
  content: {
    height: (window.height * 5) / 7,
    backgroundColor: '#fff',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    color: '#424244',
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    width: 60,
    height: 48,
    right: 0,
    paddingRight: 14,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  closeText: {
    fontSize: 20,
  },
  tabs: {
    flexDirection: 'row',
    height: 40,
    borderBottomWidth: onePt,
    borderBottomColor: '#06082833',
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    color: '#424244',
  },
  tabTextActivity: {
    color: '#007aff',
  },
  activityLine: {
    position: 'absolute',
    bottom: 0,
    width: 36,
    height: 2,
    backgroundColor: '#007aff',
  },
  allList: {
    flex: 1,
  },
})

export default index
