# se-jie-admin-react

## Environment Prepare

Install `node_modules`:

```bash
pnpm install
```

## Provided Scripts

Tio Boot Admin provides some useful script to help you quick start and build with web project, code style check and test.

Scripts provided in `package.json`. It's safe to modify or add additional script:

### Start project

```bash
pnpm start
```

or

```
pnpm dev
```

### Build project

```bash
pnpm build
```

### Check code style

```bash
pnpm lint
```

You can also use script to auto fix some lint error:

```bash
pnpm lint:fix
```

### Test code

```bash
pnpm test
```
### deploy to github gh-pages
```bash
pnpm build
pnpm gh-pages
```
### flyio
```
fly apps create kimi-admin-react
fly deploy
```
## More

You can view full document on our [official website](https://pro.ant.design). And welcome any feedback in our [github](https://github.com/ant-design/ant-design-pro).
