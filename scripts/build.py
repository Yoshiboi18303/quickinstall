import os


def clear():
    # Ignore any "Code is unreachable" messages, that's intended as you're not running the other OS.
    # For example, you're running Windows, the "else" block will be unreachable.
    # Again, ignore any "Code is unreachable" messages from this function.
    if os.name == "nt":  # Windows
        os.system("cls")
    else:  # MacOS/Linux
        os.system("clear")


# Change the value to False if you don't want the console cleared.
should_clear = True

if should_clear:
    clear()

success: bool = os.system("tsc --outDir bin") == 0

if success:
    print("Built!")
else:
    print("Build failed.")
