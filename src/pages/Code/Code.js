import React, { useState, useEffect, useContext } from 'react'
import MainCont from '../../components/MainCont/MainCont'
import LeftNavbar from '../../components/LeftNavbar'
import Layout from '../../components/Layout/Layout'
import { FiTrash } from 'react-icons/fi'
import TopNavbar from '../../components/TopNavbar/Top'
import { Util, Notification } from '../../helpers/util'
import DataContext from '../../context/DataContext'
import apiRoutes from "../../api_routes/index"
import useFetch from '../../hooks/useFetch'
import "./style.css"

const util = new Util()
const notfy = new Notification()

function Code() {
    const { localData, fetchUser } = useContext(DataContext)
    if (localStorage.getItem("e-workflow") === null) {
        window.location = "/signup"
    }

    useEffect(() => {
        (async () => {
            let res = await fetchUser();
            const { loading, error, data } = res;
            let user = data[0][0];

            if (user.userId !== localData.id || user.userRole !== "admin") {
                util.redirect("http://localhost:3000/user/settings", 0)
            }
        })()

    }, [])

    return (
        <Layout>
            <LeftNavbar active="code" />
            <MainCont>
                <TopNavbar activeBar={"Code / Token"} />
                <GenerateCode />
            </MainCont>
        </Layout>
    )
}

export default Code


function GenerateCode() {
    const [token, setToken] = useState("")
    const [savedToken, setSavedToken] = useState(false);
    // get all codes generated by admin
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")
    const [result, setResult] = useState([])

    const { refreshToken, id, role } = JSON.parse(localStorage.getItem("e-workflow"))



    useEffect(() => {
        const options = {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${refreshToken}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({ userId: id })
        }
        try {
            (async function makeRequest() {
                setLoading(true)
                let req = await fetch(apiRoutes.getTokens, options);
                let res = await req.json();

                setLoading(false)

                if (req.status !== 200 && res.error === true) {
                    setLoading(false)
                    return setError(res.message)
                }
                setError("")
                setResult(res);
            })()
        } catch (err) {
            setError(err.message);
            setLoading(false);
            setResult([]);
        }

        console.log(result);
    }, [token, savedToken])

    async function saveGeneratedToken() {
        const options = {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${refreshToken}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({ userId: id, role, token })
        }
        try {
            (async function makeRequest() {
                setLoading(true)
                let req = await fetch(apiRoutes.createToken, options);
                let res = await req.json();

                setLoading(false)
                setSavedToken(!savedToken)
                if (req.status !== 200 && res.error === true) {
                    setLoading(false)
                    return notfy.error(res.message)
                }
                notfy.success(res.message, 2000)
            })()
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }

    async function deleteToken(e) {
        let token = e.target.dataset.token;
        const options = {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${refreshToken}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({ userId: id, token })
        }
        try {
            (async function makeRequest() {
                setLoading(true)
                let req = await fetch(apiRoutes.deleteToken, options);
                let res = await req.json();

                setLoading(false)
                setSavedToken(!savedToken)
                if (req.status !== 200 && res.error === true) {
                    setLoading(false)
                    return notfy.error(res.message)
                }
                notfy.success(res.message, 2000)
            })()
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }

    function generateToken() {
        let token = util.generateToken();
        setToken(token)
    }



    return (
        <div className="code-cont">
            <div className="left">
                <div className="head">
                    <p>List of Tokens</p>
                </div>
                <br />
                {
                    loading === false
                        ?
                        error !== ""
                            ?
                            <p>{"error"}</p>
                            :
                            <table className="table table-striped table-hover codes-list">
                                <thead>
                                    <tr>
                                        <th>S/N</th>
                                        <th>Tokens</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        result.length === 0 || (result.data !== undefined && result.data.length === 0)
                                            ?
                                            <tr>
                                                <td>No Token generated</td>
                                            </tr>
                                            :
                                            result.data.map((list, i) => {
                                                return (
                                                    <tr>
                                                        <td>{i}</td>
                                                        <td>#{list.token}</td>
                                                        <td>{list.issued_at}</td>
                                                        <td>
                                                            <FiTrash className='icon' data-token={list.token}
                                                                onClick={(e) => {
                                                                    deleteToken(e)
                                                                }} />
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                    }

                                </tbody>
                            </table>
                        :
                        <>
                            <p>Loading...</p>
                        </>
                }
            </div>
            <div className="right">
                <div className="head">
                    <p>Generate Tokens</p>
                </div>
                <div className="generate-cont">
                    <input type="text" defaultValue={token} placeholder='6-digit token' className="input" disabled />
                    <div className="actions">
                        <button className={token === "" ? "inactive btn" : "save btn"} onClick={saveGeneratedToken}>Save</button>
                        <button className="generate btn" onClick={generateToken}>Generate</button>
                    </div>
                </div>
            </div>
        </div>
    )
}