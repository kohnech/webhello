import React, { Component } from 'react';
import { trace, context } from '@opentelemetry/api';
import { Link } from 'react-router-dom';
import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import AppNavbar from './AppNavbar';
import {
    useLocation,
    useNavigate,
    useParams,
  } from "react-router-dom";

class EmployeeEdit extends Component {

    emptyItem = {
        name: '',
        role: ''
    };

    constructor(props) {
        super(props);
        this.state = {
            item: this.emptyItem
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.tracer = trace.getTracer('user-interactions');
    }

    async componentDidMount() {
        const { id } = this.props.router.params;
        if (id !== 'new') {
            const client = await (await fetch(`/employees/${id}`)).json();
            this.setState({item: client});
        }
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        let item = {...this.state.item};
        item[name] = value;
        this.setState({item});
    }

async handleSubmit(event) {
    event.preventDefault();
    const {item} = this.state;

    const span = this.tracer.startSpan('user.save_button_clicked');

    span.setAttributes({
                'user.action': 'save_button_clicked',
                'component': 'EmployeeList',
                'ui.button': 'save'
    });

    const ctx = trace.setSpan(context.active(), span);

    try {
        await context.with(ctx, async () => {
        await fetch('/employees' + (item.id ? '/' + item.id : ''), {
            method: (item.id) ? 'PUT' : 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item),
        });
        });
    } finally {
        span.end();
    }
    this.props.router.navigate('/employees');
    
}

    render() {
        const {item} = this.state;
        const title = <h2>{item.id ? 'Edit Employee' : 'Add Employee'}</h2>;

        return <div>
            <AppNavbar/>
            <Container>
                {title}
                <Form onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Label for="name">Name</Label>
                        <Input type="text" name="name" id="name" value={item.name || ''}
                               onChange={this.handleChange} autoComplete="name"/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="role">Role</Label>
                        <Input type="text" name="role" id="role" value={item.role || ''}
                               onChange={this.handleChange} autoComplete="role"/>
                    </FormGroup>
                    <FormGroup>
                        <Button color="primary" type="submit">Save</Button>{' '}
                        <Button color="secondary" tag={Link} to="/employees">Cancel</Button>
                    </FormGroup>
                </Form>
            </Container>
        </div>
    }
}

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
      let location = useLocation();
      let navigate = useNavigate();
      let params = useParams();
      return (
        <Component
          {...props}
          router={{ location, navigate, params }}
        />
      );
    }
  
    return ComponentWithRouterProp;
  }

export default withRouter(EmployeeEdit);
