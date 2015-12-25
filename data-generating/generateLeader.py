import random
import csv
from datetime import timedelta
from datetime import date

topics = ['Sports', 'Tec', 'Ecnonomy', 'Education']

opinionLeaders = ['media', 'grassroots', 'political figures']

if __name__ == "__main__":
    firstDay = date(2015, 1, 1)
    fieldnames = ['date', 'leadergroup', 'topic', 'attention']
    with open('leaders.csv', 'a', newline='') as headerFile:
        leaderwriter = csv.DictWriter(headerFile, fieldnames=fieldnames)
        leaderwriter.writerow({'leadergroup': 'leadergroup',
                               'topic': 'topic',
                               'attention': 'attention',
                               'date': 'date'})
    for i in range(100):
        today = firstDay + timedelta(days=i)
        with open('leaders.csv', 'a', newline='') as csvFile:
            for leader in opinionLeaders:
                leaderAttention = {}
                for topic in topics:
                    leaderAttention[topic] = random.randint(0, 6)
                temp_sum = sum(leaderAttention.values())
                for topic in topics:
                    leaderwriter = csv.DictWriter(csvFile, fieldnames=fieldnames)
                    leaderwriter.writerow({'leadergroup': leader,
                                           'topic': topic,
                                           'attention': leaderAttention[topic] / temp_sum,
                                           'date': str(today)})



