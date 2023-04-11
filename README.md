# quickinstall

A CLI for quickly installing packages, provides support for NPM, Yarn and PNPM!

![Demo GIF](https://cdn.discordapp.com/attachments/1028104425371340851/1095402827888730112/quickinstall_Demo_GIF.gif)
![Demo 2 GIF](https://cdn.discordapp.com/attachments/1028104425371340851/1095412945338507285/quickinstall_Demo_2.gif)

---

## Installation

You can install `quickinstall` to your system by running this command:

```powershell
npm i -g @yoshiboi18303/quickinstall
```

After that just run:

```powershell
quickinstall
```

And follow the prompts, it's that easy!

---

## Debug Mode

This CLI provides a debug mode, if you want to get more information.

There are two ways to activate debug mode...

### Way 1, config file

This method requires a configuration file, here's how you would go about this:

**Step one:** Create a `quickinstall.json` file in the current working directory (AKA, where your terminal/project is).

**Step two:** Replace the contents of the configuration file with this:

```json
{
  "debug": true
}
```

This will enable debug mode, if you ever want it off, either set debug to `false` or remove the configuration file.

### Way 2, debug option

This CLI also provides a `--debug` option, here's how to use this with the CLI:

```powershell
quickinstall --debug
```

**OR**

```powershell
quickinstall -d
```

This will add debug messages to the console.

---

## Use this source code

Here's how you can use this CLI's source code.

### Prerequisites

You will need: [**`Node.js`**](https://nodejs.org), **`npm`** _(bundled with `Node.js`)_ and [`Python`](https://python.org) _(optional, to run the provided scripts)_

_**Bolded**_ prerequisites are required.

---

Here's what you need to do after installing the required prerequisites:

**1.** Clone the repository

**2.** _**THIS IS A ONE-TIME ONLY STEP**_

Run this in the project directory:

```powershell
npm link
```

**3.** Make whatever changes you want to the TypeScript files.

**4.** Once you're ready to test, run:

If you have Python installed:

```powershell
npm run build
```

Otherwise, run:

```powershell
npx tsc --outDir bin
```

---

Made with ❤️ _(and TypeScript)_ by [Yoshiboi18303](https://github.com/Yoshiboi18303)
