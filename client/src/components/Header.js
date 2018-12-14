import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

import {_setAuth} from '../actions/auth'

class Header extends React.Component{
  render(){
    if(!this.props){
      return null
    }
    console.log(this.props)
    return (
      <div>
        <Link to='/products'>Products</Link>
        {
          localStorage.getItem('token') ? (
            <div>
              <li>Hello {this.props.auth.githubUserId}!</li>
              <li><button onClick={this.props.logout}>Logout</button></li>
            </div>
          ) : (
            <a href='/api/auth/github'>Login with Github</a>
          )
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return state
}

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => {
      dispatch(_setAuth({}))
      window.localStorage.removeItem('token')
      console.log('logout complete')
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)