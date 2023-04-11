import os


def clear():
    # Ignore any "Code is unreachable" messages, that's intended as you're not running the other OS.
    # For example, you're running Windows, the "else" block will be unreachable.
    # Again, ignore any "Code is unreachable" messages from this function.
    if os.name == "nt":  # Windows
        os.system("cls")
    else:  # MacOS/Linux
        os.system("clear")


# Change the value to True if you want the console cleared.
should_clear = False

if should_clear:
    clear()

should_continue = input("Are you sure you want to continue? ").lower()

if should_continue == "yes" or should_continue == "y":
    if should_clear:
        clear()

    commit_message = input("Please enter your commit message: ")

    print("Creating Git commit...")

    os.system("git add .")

    os.system(f"git commit -m \"{commit_message}\"")

    print("Pushing...")

    success = os.system("git push -u origin main") == 0

    if success:
        print("Pushed successfully!")
    else:
        print("Failed to push...")

    print("Publishing to NPM...")

    success = os.system("npm publish") == 0

    if success:
        print("Publishing completed successfully!")
    else:
        print("Publishing failed...")
else:
    print("Operation cancelled.")
