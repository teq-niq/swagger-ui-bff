import React from "react"
import PropTypes from "prop-types"

export default class HttpAuth extends React.Component {
  static propTypes = {
    authorized: PropTypes.object,
    getComponent: PropTypes.func.isRequired,
    errSelectors: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    authSelectors: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    let { name, schema } = this.props
    let value = this.getValue()

    this.state = {
      name: name,
      schema: schema,
      value: value
    }
  }

  getValue () {
    let { name, authorized } = this.props
	const valx= authorized && authorized.getIn([name, "value"]);
    return valx
  }

  onChange =(e) => {
    let { onChange } = this.props
    let { value, name } = e.target

    let newValue = Object.assign({}, this.state.value)

    if(name) {
      newValue[name] = value
    } else {
      newValue = value
    }

    this.setState({ value: newValue }, () => onChange(this.state))

  }

  render() {
    let { schema, getComponent, errSelectors, name, authSelectors } = this.props
    const Input = getComponent("Input")
    const Row = getComponent("Row")
    const Col = getComponent("Col")
    const AuthError = getComponent("authError")
    const Markdown = getComponent("Markdown", true)
    const JumpToPath = getComponent("JumpToPath", true)

    const scheme = (schema.get("scheme") || "").toLowerCase()
    const path = authSelectors.selectAuthPath(name)
    let value = this.getValue()
    let errors = errSelectors.allErrors().filter( err => err.get("authId") === name)

    if(scheme === "basic") {
      let username = value ? value.get("username") : null
      return <div>
        <h4>
          <code>{name}</code>&nbsp;
            (http, Basic)
            <JumpToPath path={path} />
          </h4>
        { username && <h6>Authorized</h6> }
        <Row>
          <Markdown source={ schema.get("description") } />
        </Row>
        <Row>
          <label htmlFor="auth-basic-username">Username:</label>
          {
            username ? <code> { username } </code>
              : <Col>
                  <Input 
                    id="auth-basic-username"
                    type="text"
                    required="required"
                    name="username"
                    aria-label="auth-basic-username"
                    onChange={ this.onChange }
                    autoFocus
                  />
                </Col>
          }
        </Row>
        <Row>
          <label htmlFor="auth-basic-password">Password:</label>
            {
              username ? <code> ****** </code>
                       : <Col>
                            <Input 
                              id="auth-basic-password"
                              autoComplete="new-password"
                              name="password"
                              type="password"
                              aria-label="auth-basic-password"
                              onChange={ this.onChange }
                            />
                          </Col>
          }
        </Row>
        {
          errors.valueSeq().map( (error, key) => {
            return <AuthError error={ error }
                              key={ key }/>
          } )
        }
      </div>
    }

    if(scheme === "bearer") {
      return (
        <div>
          <h4>
            <code>{name}</code>&nbsp;
              (http, Bearer)
              <JumpToPath path={path} />
            </h4>
            { value && <h6>Authorized</h6>}
            <Row>
              <Markdown source={ schema.get("description") } />
            </Row>
            <Row>
              <label htmlFor="auth-bearer-value">Value:</label>
              {
                value ? <code> ****** </code>
              : <Col>
                  <Input
                    id="auth-bearer-value"
                    type="text"
                    aria-label="auth-bearer-value"
                    onChange={ this.onChange }
                    autoFocus
                  />
                </Col>
          }
        </Row>
        {
          errors.valueSeq().map( (error, key) => {
            return <AuthError error={ error }
              key={ key }/>
          } )
        }
      </div>
    )
    }
	
	if (scheme === "bff") {
	  let username = value ? value.get("name") : null
	  const loginUrl = schema.get("login")
	  const redirectforlogin = schema.get("redirectforlogin") === true

	  if (!username && redirectforlogin && loginUrl) {
	    setTimeout(() => {
	      window.location.href = loginUrl
	    }, 50)
	  }

	  return (
	    <div>
	      <h4>
	        <code>{name}</code>&nbsp;
	        (http, Bff)
	        <JumpToPath path={path} />
	      </h4>

	      { username && <h6>Authorized</h6> }

	      <Row>
	        <Markdown source={ schema.get("description") } />
	      </Row>

	      {username ? (
	        <>
	          <Row>
	            <label htmlFor="auth-bff-username">Username:</label>
	            <code>{username}</code>
	          </Row>

	          {value && Object.keys(value.toJS ? value.toJS() : value)
	            .filter(k => k !== "name")
	            .map(key => (
	              <Row key={key}>
	                <label>{key}:</label>
	                <code>{JSON.stringify(value.get ? value.get(key) : value[key])}</code>
	              </Row>
	            ))
	          }
	        </>
	      ) : redirectforlogin ? (
	        /* ===== Redirect spinner (unchanged) ===== */
	        <Row>
	          <style>
	            {`
	              @keyframes spin {
	                0% { transform: rotate(0deg); }
	                100% { transform: rotate(360deg); }
	              }

	              .redirect-container {
	                display: flex;
	                align-items: center;
	                gap: 8px;
	                font-family: sans-serif;
	                font-size: 14px;
	              }

	              .spinner {
	                width: 12px;
	                height: 12px;
	                border: 2px solid #ccc;
	                border-top: 2px solid #444;
	                border-radius: 50%;
	                animation: spin 0.8s linear infinite;
	              }
	            `}
	          </style>

	          <div className="redirect-container">
	            Redirecting to login…
	            <span className="spinner" />
	          </div>
	        </Row>
	      ) : (
	        /* ===== Inline login form (new) ===== */
	        <>
	          <Row>
	            <label htmlFor="auth-bff-username">Username:</label>
	            <Col>
	              <Input
	                id="auth-bff-username"
	                type="text"
	                name="username"
	                aria-label="auth-bff-username"
	                onChange={ this.onChange }
	                autoFocus
	              />
	            </Col>
	          </Row>

	          <Row>
	            <label htmlFor="auth-bff-password">Password:</label>
	            <Col>
	              <Input
	                id="auth-bff-password"
	                type="password"
	                name="password"
	                aria-label="auth-bff-password"
	                onChange={ this.onChange }
	              />
	            </Col>
	          </Row>
	        </>
	      )}

	      {errors.valueSeq().map((error, key) => (
	        <AuthError error={error} key={key} />
	      ))}
	    </div>
	  )
	}


  return <div>
    <em><b>{name}</b> HTTP authentication: unsupported scheme {`'${scheme}'`}</em>
  </div>
  }
}
