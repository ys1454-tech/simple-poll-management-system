class PollServiceError(Exception):
    """Base exception for poll service errors."""
    pass


class PollNotFoundError(PollServiceError):
    """Raised when a poll with the given ID does not exist."""
    pass


class PollClosedError(PollServiceError):
    """Raised when attempting an operation (e.g. voting) on a closed poll."""
    pass


class OptionNotFoundError(PollServiceError):
    """Raised when a poll option does not exist or does not belong to the target poll."""
    pass


class DuplicateVoteError(PollServiceError):
    """Raised when a student has already voted in the poll."""
    pass
