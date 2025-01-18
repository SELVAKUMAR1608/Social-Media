export const formatPostDate = (createdAt) => {
    const currentDate = new Date();
    const createdAtDate = new Date(createdAt);

    const timeDifferenceInSeconds = Math.floor((currentDate - createdAtDate) / 1000);
    const timeDifferenceInMinute = Math.floor(timeDifferenceInSeconds / 60);
    const timeDifferenceInHours = Math.floor(timeDifferenceInMinute / 60);
    const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);

    if (timeDifferenceInDays > 1) {
        return createdAtDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } else if (timeDifferenceInDays === 1) {
        return "1d";
    } else if (timeDifferenceInHours >= 1) {
        return `${timeDifferenceInHours}h`;
    } else if (timeDifferenceInMinute >= 1) {
        return `${timeDifferenceInMinute}m`;
    } else {
        return "Just now";
    }

};


export const formatMemberSinceDate = (createdAt) => {
    const options = { year: 'numeric', month: 'long' };
    return new Date(createdAt).toLocaleDateString('en-US', options);
};
