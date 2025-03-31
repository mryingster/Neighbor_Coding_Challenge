# Multi-Vehicle Search Take-Home Challenge

## Prompt
We'd like you to write a search algorithm that will allow renters to find locations where they could store multiple vehicles. Please write and deploy and endpoint that:

1. Accepts a request like:
    ```bash
    curl -X POST "http://your-api.com/" \
        -H "Content-Type: application/json" \
        -d '[
                {
                    "length": 10,
                    "quantity": 1
                },
                {
                    "length": 20,
                    "quantity": 2
                },
                {
                    "length": 25,
                    "quantity": 1
                }
            ]'
    ```
    Each item in the request array represents vehicles that needs to be stored. The `length` is the length of the vehicle in feet. You can assume that the `width` of each vehicle is 10 feet. The `quantity` is how many vehicles of those dimensions need to be stored. 

    The sum of all `quantity` values will always be less than or equal to 5.

1. Searches through the array of listings provided in the attached `listings.json` file. Where each listing looks like:
    ```json
    {
        "id": "abc123",
        "length": 10,
        "width": 20,
        "location_id": "def456",
        "price_in_cents": 100,
    }
    ```

    All `length` and `width` values are multiples of 10.

1. And returns a response like:
    ```json
    [
        {
            "location_id": 1,
            "listing_ids": [1, 2, 3],
            "total_price_in_cents": 300
        },
        {
            "location_id": 2,
            "listing_ids": [4, 5],
            "total_price_in_cents": 305
        }
    ]
    ```
    The results should:
    1. Include every possible location that could store all requested vehicles
    1. Include the cheapest possible combination of listings per location
    1. Include only one result per location_id
    1. Be sorted by the total price in cents, ascending

## Submission
Please reply to this email with the following:

- Feedback on the project
- Duration
- Link to Github repo
- Link to API

We're primarily looking to see that candidates can get a solution working, deployed, and reasonably performant. We advise you to spend no more than 6 total hours on this project.

Thank you and we look forward to reviewing your submission. We'll review every submission within 3 business days of receiving it and will notify you when you can take down your API.