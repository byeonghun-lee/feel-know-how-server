const checkedLogin = (ctx, next) => {
    if (!ctx.state.auth) {
        ctx.status = 401;
        return;
    }

    return next();
};

export default checkedLogin;
