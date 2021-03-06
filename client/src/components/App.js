import React from 'react'
import {HashRouter, Route} from 'react-router-dom'
import {connect} from 'react-redux'
import queryString from 'query-string'

import Cart from './Cart'
import CategoryDetail from './CategoryDetail'
import Checkout from './Checkout'
import Header from './Header'
import Main from './Main'
import OrderHistory from './OrderHistory'
import ProductList from './ProductList'
import ProductDetail from './ProductDetail'
import OrderConfirmation from './OrderConfirmation'
import OrderView from './OrderView'

import {setAuth} from '../actions/auth'
import {setCart} from '../actions/cart'

class App extends React.Component{
  render(){
    return (
      <HashRouter>
        <div>
          <Route path="/" component={Header} />
          <Route exact path="/" component={Main} />
          <Route path="/cart" component={Cart} />
          <Route path="/categories/:categoryId" component={CategoryDetail} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/orderhistory" component={OrderHistory} />
          <Route exact path="/products" component={ProductList} />
          <Route path="/products/:productId" component={ProductDetail} />
          <Route path="/orderconfirmation/:orderId" component={OrderConfirmation} />
          <Route path="/orderview/:orderId" component={OrderView} />
        </div>
      </HashRouter>
    )
  }
  componentDidMount(){
    this.props.init()
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    init: () => {
      dispatch(setAuth(queryString.parse(window.localStorage.getItem('token'))))
      dispatch(setCart(queryString.parse(window.localStorage.getItem('token'))))
    }
  }
}

export default connect(null, mapDispatchToProps)(App)
