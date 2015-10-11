import os
import subprocess


class BuildError(Exception):
    """ Exception used to report building errors """
    pass


def out(message, level='info'):
    """ Output a message to the user.

    Args:
        message (str): Message to output
        level (str, Optional): Type of message. One of
            'info' (default), 'warning', 'error'.
    """
    print message


def run_command(command, values):
    """ Execute the given shell command after replacing
        the placeholders with given values.

    Args:
        command (array): Command to run_commandute, as an array of
            parameters.
        values (dict): Dict of placeholder name to value, to
            be replaced in al parts of the command array.

    Returns:
        str: Command output

    Raises:
        BuildError: if the command failed
    """
    final_command = []
    for part in command:
        final_command.append(part.format(**values))
    try:
        output = subprocess.check_output(final_command)
    except subprocess.CalledProcessError as e:
        raise BuildError(
            'Failed running {cmd}: {e}'.format(
                cmd=' '.join(final_command),
                e=str(e)
            )
        )
    return output


def backup_and_remove(filename):
    """ Backup and remove the given file

    The file is backed up and remove by appending a ~
    to it's name. If such a file exists already, it is
    deleted first.

    Args:
        filename (str): Name of file to backup and remove
    Raises:
        BuildError: On build errors
    """
    if os.path.exists(filename):
        if os.path.exists(filename + '~'):
            try:
                os.remove(filename + '~')
            except Exception as e:
                raise BuildError(
                    'Failed to remove backup file {f}: {e}'.format(
                        f=filename+'~',
                        e=str(e)
                    ))
        try:
            os.rename(filename, filename + '~')
        except Exception as e:
            raise BuildError(
                'Failed to backup file {f}: {e}'.format(
                    f=filename,
                    e=str(e)
            ))
