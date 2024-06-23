import {Link} from 'react-router-dom';
import Button from '@mui/material/Button';

export default function Customers(){
    return <>
    <h1>Customers</h1>
    <Link to="/">
    <Button variant="outlined">Invoices</Button>
    </Link>
    </>
}