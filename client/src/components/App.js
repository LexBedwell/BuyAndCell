import React from 'react'
import {HashRouter, Route} from 'react-router-dom'
import {connect} from 'react-redux'
import queryString from 'query-string'

import Cart from './Cart'
import Header from './Header'
import Main from './Main'
import CategoryDetail from './CategoryDetail'
import ProductList from './ProductList'
import ProductDetail from './ProductDetail'

import {loadCategories} from '../actions/categories'
import {loadProducts} from '../actions/products'
import {setAuth} from '../actions/auth'
import {loadCart} from '../actions/cart'

class App extends React.Component{
  render(){
    return (
      <HashRouter>
        <div>
          <Route path="/" component={Header} />
          <Route exact path="/" component={Main} />
          <Route path="/cart" component={Cart} />
          <Route path="/categories/:categoryId" component={CategoryDetail} />
          <Route exact path="/products" component={ProductList} />
          <Route path="/products/:productId" component={ProductDetail} />
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
      dispatch(loadProducts())
      dispatch(loadCategories())
      dispatch(setAuth(queryString.parse(window.localStorage.getItem('token'))))
      dispatch(loadCart(queryString.parse(window.localStorage.getItem('token'))))
    }
  }
}

export default connect(null, mapDispatchToProps)(App)

