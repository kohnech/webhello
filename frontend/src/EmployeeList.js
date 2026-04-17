import React, { Component } from 'react';
import { Button, ButtonGroup, Container, Table } from 'reactstrap';
import AppNavbar from './AppNavbar';
import { Link } from 'react-router-dom';
import { trace, context } from '@opentelemetry/api';

class EmployeeList extends Component {

    constructor(props) {
        super(props);
        this.state = {clients: []};
        this.delete = this.delete.bind(this);
        this.edit = this.edit.bind(this);
        this.tracer = trace.getTracer('employee-list-component');
    }

    componentDidMount() {
        console.log("componentDidMount")
        fetch('/all')
            .then(response => response.json())
            .then(data => this.setState({clients: data}));
        console.log(this.state.clients)
    }

    async delete(id) {
        console.log('Delete button clicked, creating span...');
        const span = this.tracer.startSpan('user.delete_employee_click');
        console.log('Span created:', span);
        
        // Use the context API to bind the current context
        const ctx = trace.setSpan(context.active(), span);
        
        try {
            span.setAttributes({
                'user.action': 'delete_button_clicked',
                'employee.id': id,
                'component': 'EmployeeList',
                'ui.button': 'delete'
            });
            
            console.log(`User clicked Delete button for employee ID: ${id}`);
            
            await fetch(`/employees/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    let updatedClients = [...this.state.clients].filter(i => i.id !== id);
                    this.setState({clients: updatedClients});
                    span.setAttributes({
                        'delete.success': true,
                        'employees.remaining': updatedClients.length
                    });
                    console.log('Delete successful, span attributes set');
                } else {
                    span.recordException(new Error('Failed to delete employee'));
                    span.setAttributes({
                        'delete.success': false
                    });
                }
            });
        } catch (error) {
            console.error('Error in delete:', error);
            span.recordException(error);
            span.setAttributes({
                'delete.success': false,
                'error.message': error.message
            });
        } finally {
            console.log('Ending span...');
            span.end();
        }
    }

    async edit(id, newData) {
        const span = this.tracer.startSpan('user.edit_employee_click');
        
        try {
            span.setAttributes({
                'user.action': 'edit_button_clicked',
                'employee.id': id,
                'component': 'EmployeeList',
                'ui.button': 'edit'
            });
            
            console.log(`User clicked Edit button for employee ID: ${id}`);
            
            await fetch(`/employees/${id}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newData)
            })
            .then(response => {
                if (!response.ok) {
                    span.recordException(new Error('Failed to edit employee'));
                    throw new Error('Failed to edit employee');
                }
                return response.json();
            })
            .then(updatedEmployee => {
                const updatedClients = this.state.clients.map(client => {
                    if (client.id === id) {
                        return updatedEmployee;
                    }
                    return client;
                });
                this.setState({ clients: updatedClients });
                span.setAttributes({
                    'edit.success': true,
                    'employee.name': updatedEmployee.name || 'unknown'
                });
            })
            .catch(error => {
                console.error('Error editing employee:', error);
                span.recordException(error);
                span.setAttributes({
                    'edit.success': false,
                    'error.message': error.message
                });
            });
        } finally {
            span.end();
        }
    }
    

    render() {
        const {clients} = this.state;

        const employeeList = clients.map(client => {
            return <tr key={client.id}>
                <td style={{whiteSpace: 'nowrap'}}>{client.name}</td>
                <td>{client.role}</td>
                <td>
                    <ButtonGroup>
                        <Button size="sm" color="primary" onClick={() => this.edit(client.id)}>Edit</Button>
                        <Button size="sm" color="danger" onClick={() => this.delete(client.id)}>Delete</Button>
                    </ButtonGroup>
                </td>
            </tr>
        });

        return (
            <div>
                <AppNavbar/>
                <Container fluid>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3>Employees</h3>
                        <Button color="success" tag={Link} to="/employees/new">Add Employee</Button>
                    </div>
                    <Table className="mt-4">
                        <thead>
                        <tr>
                            <th width="30%">Name</th>
                            <th width="30%">Role</th>
                            <th width="40%">Operation</th>
                        </tr>
                        </thead>
                        <tbody>
                        {employeeList}
                        </tbody>
                    </Table>
                </Container>
            </div>
        );
    }
}

export default EmployeeList;