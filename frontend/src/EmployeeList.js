import React, { Component } from 'react';
import { Button, ButtonGroup, Container, Table } from 'reactstrap';
import AppNavbar from './AppNavbar';
import { Link } from 'react-router-dom';

class EmployeeList extends Component {

    constructor(props) {
        super(props);
        this.state = {clients: []};
        this.delete = this.delete.bind(this);
        this.edit = this.edit.bind(this);
    }

    componentDidMount() {
        console.log("componentDidMount")
        fetch('/all')
            .then(response => response.json())
            .then(data => this.setState({clients: data}));
        console.log(this.state.clients)
    }

    async delete(id) {
        await fetch(`/employees/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(() => {
            let updatedClients = [...this.state.clients].filter(i => i.id !== id);
            this.setState({clients: updatedClients});
        });
    }

    async edit(id, newData) {
        await fetch(`/employees/${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData) // Assuming newData contains the updated employee data
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to edit employee');
            }
            return response.json();
        })
        .then(updatedEmployee => {
            // Assuming you want to update the state with the updated employee
            const updatedClients = this.state.clients.map(client => {
                if (client.id === id) {
                    return updatedEmployee; // Replace the existing employee with the updated one
                }
                return client;
            });
            this.setState({ clients: updatedClients });
        })
        .catch(error => {
            console.error('Error editing employee:', error);
            // Handle error (e.g., show error message to the user)
        });
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
                    <h3>Employees</h3>
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