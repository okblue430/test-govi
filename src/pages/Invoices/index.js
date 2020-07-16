import React, {useState, useEffect} from 'react';
import './style.scss';
import Loader from 'react-loader-spinner'
import moment from 'moment';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import api from '../../api';

const SHOW_PAGE_ITEMS = 10

export default function Invoices() {
    const [fetching, setFetching] = useState(false)
    const [invoiceData, setInvoiceData] = useState([])
    const [activePage, setActivePage] = useState(1)
    const [pageFirst, setPageFirst] = useState('')
    const [pageLast, setPageLast] = useState('')
    const [pagePrev, setPagePrev] = useState('')
    const [pageNext, setPageNext] = useState('')
    const [selOption, setSelOption] = useState('all')
    
    const setData = (response) => {
        if(response === undefined) {
            setInvoiceData([])
            setActivePage(1)
            setPageFirst('')
            setPageLast('')
            setPagePrev('')
            setPageNext('')
            setSelOption('all')
        } else {
            const { headers, data } = response
            setInvoiceData(data)
            let links = headers.link.split(",")
            var first_link = ''
            var last_link = ''
            var prev_link = ''
            var next_link = ''
            for(let k of links) {
                k = k.trim()
                if(k.includes('first')) {
                    // <http://bcore-mock.herokuapp.com/invoice?_page=1>; rel="first",
                    k = k.replace('<', '')
                    k = k.replace('>; rel="first"', '')
                    first_link = k
                } else if (k.includes('last')) {
                    k = k.replace('<', '')
                    k = k.replace('>; rel="last"', '')
                    last_link = k
                } else if (k.includes('prev')) {
                    k = k.replace('<', '')
                    k = k.replace('>; rel="prev"', '')
                    prev_link = k
                } else if (k.includes('next')) {
                    k = k.replace('<', '')
                    k = k.replace('>; rel="next"', '')
                    next_link = k
                }
            }
            setPageFirst(first_link)
            setPageLast(last_link)
            setPagePrev(prev_link)
            setPageNext(next_link)
        }
    }
    async function getData(type, link, filter, page, pageSize) {
        setFetching(true)
        if(type === 'direct') {
            let params = {}
            if(filter === 'paid') {
                params.paid = true
            }else if(filter === 'unpaid') {
                params.paid = false
            }
            const result = await api.getPaginationInvoices(link, params)
            setFetching(false)
            if(result.status === 200) {
                setData(result)
            } else {
                setData(undefined)
            }
        }else {
            let params = {}
            if(filter === 'paid') {
                params.paid = true
            }else if(filter === 'unpaid') {
                params.paid = false
            }
            params._page = page
            params._limit = pageSize
            const result = await api.getInvoices(params)
            setFetching(false)
            if(result.status === 200) {
                setData(result)
            } else {
                setData(undefined)
            }
        }
    }

    const onClick = (link) => {
        if(link) {
            getData('direct', link, selOption, activePage, SHOW_PAGE_ITEMS)
        }
    }

    const toggleCheckboxChange = (type) => {
        setSelOption(type)
        getData('default', '', type, activePage, SHOW_PAGE_ITEMS)
    }

    useEffect(() => {
        getData('default', '',selOption, activePage, SHOW_PAGE_ITEMS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="invoice-container">
          <div>
            <h3>Invoices Data</h3>
            <div className="action-area">
                <label>
                    <input
                        type="checkbox"
                        value="all"
                        checked={ selOption === 'all' ? true : false }
                        onChange={() => toggleCheckboxChange('all')}
                    />
                    All
                </label>
                <label>
                    <input
                        type="checkbox"
                        value="paid"
                        checked={ selOption === 'paid' ? true : false }
                        onChange={() => toggleCheckboxChange('paid')}
                    />
                    Paid
                </label>
                <label>
                    <input
                        type="checkbox"
                        value="unpaid"
                        checked={ selOption === 'unpaid' ? true : false }
                        onChange={() => toggleCheckboxChange('unpaid')}
                    />
                    Unpaid
                </label>
            </div>
            {fetching ? <Loader
                type="Puff"
                color="#00BFFF"
                height={100}
                width={100}
            /> :
            <div className="invoice-data">
                {invoiceData.map((row, key) =>
                {
                    let is_showing_data = Number(key) < activePage * SHOW_PAGE_ITEMS && Number(key) >= SHOW_PAGE_ITEMS * Number(activePage - 1) 
                    if(is_showing_data) {
                    return (
                        <div className="row" key={key} >
                        <div className="column order_amount">{row.amount}</div>
                        <div className="column order_currency">{row.currency}</div>
                        <div className="column date order_date">{moment(row.date).format("MMM DD YYYY")}</div>
                        <div className="column date order_due">{moment(row.due).format("MMM DD YYYY")}</div>
                        <div className="column order_paid">{row.paid ? 'Paid' : 'Unpaid'}</div>
                        <div className="column date order_paid_date">{moment(row.paidDate).format("MMM DD YYYY")}</div>
                        </div>
                    )
                    }else {
                        return null
                    }
                }
                )}
                <div className="pagination-container">
                    <div onClick={() => onClick(pageFirst)} className={`page-btn ${pageFirst ? 'active' : ''}`}>First</div>
                    <div onClick={() => onClick(pagePrev)} className={`page-btn ${pagePrev ? 'active' : ''}`}>Prev</div>
                    <div onClick={() => onClick(pageNext)} className={`page-btn ${pageNext ? 'active' : ''}`}>Next</div>
                    <div onClick={() => onClick(pageLast)} className={`page-btn ${pageLast ? 'active' : ''}`}>Last</div>
                </div>
            </div>}
          </div>
        </div>
    )
}