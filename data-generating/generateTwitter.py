import random
import csv
from datetime import timedelta
from datetime import date

import topicWord

topicsConfig = {'Sports': topicWord.sportsWords, 'Tec': topicWord.tecWords,
                'Ecnonomy': topicWord.ecnonomyWords, 'Education': topicWord.educationWords}

# opinionLeaders = ['media', 'grassroots', 'political figures']

# each day's twitts about 3000 - 5000, moniter 100 days
# each topic 10% - 50% per day accouting for all day

# leaders three parts : m(i, g) => g's attention on i
#

if __name__ == '__main__':
    firstDay = date(2015, 1, 1)
    fieldnames = ['username', 'date', 'content', 'topic']
    with open('raw_twitter.csv', 'a', newline='') as headerFile:
        headerwriter = csv.DictWriter(headerFile, fieldnames=fieldnames)
        headerwriter.writerow({'username': 'username',
                               'date': 'date',
                               'content': 'content',
                               'topic': 'topic'})
    for i in range(100):
        today = firstDay + timedelta(days=i)
        todayCount = random.randint(3000, 5000)
        topicsPercent = {}
        for k in topicsConfig:
            topicsPercent[k] = random.randint(1, 8)
        temp_sum = sum(topicsPercent.values())
        for k in topicsConfig:
            topicsPercent[k] = topicsPercent[k] / temp_sum

        for topic, wordlist in topicsConfig.items():
            topicCount = int(topicsPercent[k] * todayCount)
            with open('raw_twitter.csv', 'a', newline='') as csvfile:
                for index in range(topicCount):
                    twitterwriter = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    twitter_content = random.sample(wordlist, random.randint(3, 5))
                    common_content = random.sample(topicWord.commonWords, 5)
                    content = twitter_content + common_content
                    random.shuffle(content)
                    twitterwriter.writerow({'username': ''.join(random.sample(topicWord.letters, 5)),
                                            'date': str(today),
                                            'content': ' '.join(content),
                                            'topic': topic})




