import axios, { Method } from 'axios'
import { useState, ChangeEvent } from 'react'
import {
  DEFAULT_REQUEST_URL,
  METHODS,
  HEALTHCHECK_REQUEST_URL,
  HEALTHCHECK_REQUEST_INTERVAL_MS,
  INITIAL_SERVER_ID,
} from '@/constants'
import { useHealthcheck } from '@/hooks'
import {
  Button,
  Input,
  Space,
  Typography,
  Checkbox,
  Tag,
  Radio,
  RadioChangeEvent,
} from 'antd'
import type { CheckboxValueType } from 'antd/es/checkbox/Group'
import { v4 } from 'uuid'
import { PlusOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { TopRegion } from '@/components/TopRegion'

const { Paragraph, Text, Title } = Typography

export const App = () => {
  const [loading, setLoading] = useState(false)
  const [createServerloading, setCreateServerLoading] = useState(false)
  const [isNetworkError, setIsNetworkError] = useState(false)
  const [requestMethod, setRequestMethod] = useState<Method>(METHODS[0])
  const [requestURL, setRequestURL] = useState('')
  const [requestHeader, setRequestHeader] = useState<Record<string, string>>({})
  const [requestHeaderKey, setRequestHeaderKey] = useState('')
  const [requestHeaderValue, setRequestHeaderValue] = useState('')
  const [allowedOrigin, setAllowedOrigin] = useState('')
  const [allowedHeaders, setAllowedHeaders] = useState<string[]>([])
  const [headerInputValue, setHeaderInputValue] = useState('')

  const [allowedMethods, setAllowedMethods] = useState<Method[]>([])
  const [serverID, setServerID] = useState(INITIAL_SERVER_ID)

  const { isServerUp } = useHealthcheck({
    url: HEALTHCHECK_REQUEST_URL,
    intervalMS: HEALTHCHECK_REQUEST_INTERVAL_MS,
    serverID,
  })

  const handleChangeAllowedOrigin = (e: ChangeEvent<HTMLInputElement>) =>
    setAllowedOrigin(e.target.value)

  const handleChangeHeaderInputValue = (e: ChangeEvent<HTMLInputElement>) =>
    setHeaderInputValue(e.target.value)

  const handleInputConfirm = () => {
    if (!headerInputValue) return
    if (allowedHeaders.includes(headerInputValue)) return
    setAllowedHeaders([...allowedHeaders, headerInputValue])
    setHeaderInputValue('')
  }

  const handleClose = (removedHeader: string) => {
    setAllowedHeaders(allowedHeaders.filter((header) => header !== removedHeader))
  }

  const handleChangeAllowedMethods = (checkedvalues: CheckboxValueType[]) =>
    setAllowedMethods(checkedvalues as Method[])

  const handleClickCreateServer = async () => {
    setCreateServerLoading(true)

    try {
      await axios.post('http://localhost:8080/api/createServer', {
        origin: allowedOrigin || 'http://localhost:3000',
        allowedHeaders,
        methods: allowedMethods.join(','),
      })
      setServerID(v4())
    } catch (e) {
      console.log(e)
    } finally {
      setCreateServerLoading(false)
    }
  }

  const handleChangeRequestMethod = (e: RadioChangeEvent) =>
    setRequestMethod(e.target.value)

  const handleChangeRequestURL = (e: ChangeEvent<HTMLInputElement>) =>
    setRequestURL(e.target.value)

  const handleChangeRequestHeaderKey = (e: ChangeEvent<HTMLInputElement>) =>
    setRequestHeaderKey(e.target.value)

  const handleChangeRequestHeaderValue = (e: ChangeEvent<HTMLInputElement>) =>
    setRequestHeaderValue(e.target.value)

  const handleClickAddRequestHeader = () => {
    if (!requestHeaderKey) return
    setRequestHeader({ ...requestHeader, [requestHeaderKey]: requestHeaderValue })
    setRequestHeaderKey('')
    setRequestHeaderValue('')
  }

  const handleCloseRequestHeader = (removedHeader: string) => {
    const { [removedHeader]: deletedKey, ...rest } = requestHeader
    setRequestHeader(rest)
  }

  const handleClickRequestButton = async () => {
    setLoading(true)
    setIsNetworkError(false)

    try {
      await axios.request({
        method: requestMethod,
        url: requestURL || DEFAULT_REQUEST_URL,
        headers: requestHeader,
      })
    } catch (e) {
      console.log(e)
      setIsNetworkError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Space direction="vertical">
      <TopRegion />
      <hr />
      <Space direction="vertical">
        <Title level={1}>Try sending a request!</Title>
      </Space>
      <div className="flex">
        <div className="basis-0 grow">
          <div className="ml-auto box">frontend</div>
          <div className="ant-table-container">
            <table className="w-full">
              <tbody className="ant-table-thead">
                <tr className="ant-table-row">
                  <th>Request URL</th>
                  <td className="ant-table-cell p-2">
                    <Input
                      placeholder={DEFAULT_REQUEST_URL}
                      value={allowedOrigin}
                      onChange={handleChangeRequestURL}
                    />
                  </td>
                </tr>
                <tr className="ant-table-row">
                  <th>Current Origin</th>
                  <td className="ant-table-cell p-2">{window.location.origin}</td>
                </tr>
                <tr className="ant-table-row">
                  <th>Request Headers</th>
                  <td className="ant-table-cell p-2">
                    <div className="flex">
                      <Input
                        className="grow basis-0"
                        placeholder="X-KEY-NAME"
                        value={requestHeaderKey}
                        onChange={handleChangeRequestHeaderKey}
                      />
                      <div className="mx-1 font-bold">:</div>
                      <Input
                        className="grow basis-1/3"
                        placeholder="MY VALUE"
                        value={requestHeaderValue}
                        onChange={handleChangeRequestHeaderValue}
                      />
                      <Button
                        icon={<PlusOutlined />}
                        onClick={handleClickAddRequestHeader}
                      />
                    </div>
                    <div className="mt-1">
                      {Object.entries(requestHeader).map(([key, value]) => (
                        <Tag
                          key={key}
                          closable
                          onClose={(e) => {
                            e.preventDefault()
                            handleCloseRequestHeader(key)
                          }}
                          className="tag"
                        >
                          {key}: {value}
                        </Tag>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr className="ant-table-row">
                  <th>Request Method</th>
                  <td className="ant-table-cell p-2">
                    <Radio.Group
                      onChange={handleChangeRequestMethod}
                      value={requestMethod}
                    >
                      {METHODS.map((method) => (
                        <Radio key={method} value={method}>
                          {method}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </td>
                </tr>
                <tr className="ant-table-row">
                  <td colSpan={2}>
                    <Button
                      type="primary"
                      className="w-full"
                      loading={createServerloading}
                      onClick={handleClickRequestButton}
                    >
                      Send request with this setting!
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="basis-0">
          <div className="arrow-box">
            <ArrowRightOutlined />
            <ArrowRightOutlined />
            <ArrowRightOutlined />
            <ArrowRightOutlined />
            <ArrowRightOutlined />
          </div>
        </div>
        <div className="basis-0 grow">
          <div className="box" style={{ background: isServerUp ? 'green' : 'red' }}>
            backend
          </div>
          <div className="ant-table-container">
            <table className="w-full">
              <tbody className="ant-table-thead">
                <tr className="ant-table-row"></tr>
                <tr className="ant-table-row">
                  <th>Access-Control-Allow-Origin</th>
                  <td className="ant-table-cell p-2">
                    <Input
                      placeholder="http://localhost:3000"
                      value={allowedOrigin}
                      onChange={handleChangeAllowedOrigin}
                    />
                  </td>
                </tr>
                <tr className="ant-table-row">
                  <th>Access-Control-Allow-Headers</th>
                  <td className="ant-table-cell p-2">
                    <div className="flex">
                      <Input
                        type="text"
                        placeholder="X-MY-CUSTOM-HEADER"
                        value={headerInputValue}
                        onChange={handleChangeHeaderInputValue}
                      />
                      <Button icon={<PlusOutlined />} onClick={handleInputConfirm} />
                    </div>
                    <div className="mt-1">
                      {allowedHeaders.map((header) => (
                        <Tag
                          key={header}
                          closable
                          onClose={(e) => {
                            e.preventDefault()
                            handleClose(header)
                          }}
                          className="tag"
                        >
                          {header}
                        </Tag>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr className="ant-table-row">
                  <th>Access-Control-Allow-Origin</th>
                  <td className="ant-table-cell p-2">
                    {/* TODO: add generics for return type once available */}
                    <Checkbox.Group
                      options={METHODS}
                      onChange={handleChangeAllowedMethods}
                    />
                  </td>
                </tr>
                <tr className="ant-table-row">
                  <td colSpan={2}>
                    <Button
                      type="primary"
                      className="w-full"
                      loading={createServerloading}
                      onClick={handleClickCreateServer}
                    >
                      Setup a server with this setting!
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Space>
  )
}