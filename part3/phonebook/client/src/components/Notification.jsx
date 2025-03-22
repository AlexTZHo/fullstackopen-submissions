const Notification = ({ message, color }) => {
    if (message === null) {
        return null
    }
    const errorStyle = {
        color: color
    }
    return (
        <div className='error' style={errorStyle}>
            {message}
        </div>
    )
}

export default Notification