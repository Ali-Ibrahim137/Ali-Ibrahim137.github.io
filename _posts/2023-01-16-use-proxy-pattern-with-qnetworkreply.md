---
layout: post
title:  "How to use Proxy pattern with QNetworkReply?"
date:   2023-01-16
categories: Qt
---
## Background
In a previous project that I worked on, we had to connect to backend API using Qt framework in order to download some files and display some content of these files, this thing might look easily done using **QNetworkAccessManager** and **QNetworkReply**. But we had other things to consider:
- Size of the downloaded files was large.
- No file should be stored in the device running the application.

# Backend
I will be using **Flask** as a dummy backend, I want to keep things simple by just adding tow routes, `/api/files` to get a list of files to download, and `/api/download/file/<variant>` to download a file, the `dummy_backend.py` file will be:

{% highlight python linenos %}
from flask import abort, Flask, jsonify, send_file

app = Flask(__name__)

DUMMY_FILES = dict({
    "File1": {
        "summary": "Summary text of file 1"
    },
    "File2": {
        "summary": "Summary text of file 2"
    },
    "File3": {
        "summary": "Summary text of file 3"
    }
})

@app.route("/api/files")
def list_files():
    return jsonify(DUMMY_FILES)


@app.route("/api/download/file/<variant>")
def download_file(variant=None):
    if not variant in DUMMY_FILES:
        abort(404)
        
    return send_file(
        f"./dummy_files/{variant}.txt",
        as_attachment=True
    )


if __name__ == "__main__":
    # debug=True will cause flask to send detailed exception traceback in
    # the response body. this is useful when trying out requests from a browser
    app.run(host="0.0.0.0", port=3000, debug=True)

{% endhighlight %}

Also there will be `dummy_files` directory with three files called `File1.txt`, `File2.txt`, and `File3.txt`.

The current state can be found at this [commit.](https://github.com/Ali-Ibrahim137/Proxy-pattern-with-QNetworkReply/commit/d16df38c9307819358b45f3028481eef0b38fce0)


## UI
I will be keeping the ui very simple:
- `QTextEdit` with `readOnly` property set to `true`, the QTextEdit will be used to display the first 1000 characters of the file content. 
- `QComboBox` to list all the available files.
- `QLabel` to display summary text of the file.
- `QPushButton` to download the selected file.
UI will look like this for now, without any data.

![]({{site.url}}/assets/img/How to use Proxy pattern with QNetworkReply/Simple-ui.JPG)

The current state can be found at this [commit.](https://github.com/Ali-Ibrahim137/Proxy-pattern-with-QNetworkReply/commit/5d27e462590a50ce71929c44577243ab95866f3c)

## Implementation without Proxy Pattern
To send network requests and receive replies We need to use `QNetworkAccessManager`, Let's create two new files `api_handler.h` and `api_handler.cpp`.

Contents of `api_handler.h` will be:

{% highlight cpp linenos %}
#ifndef API_HANDLER_H
#define API_HANDLER_H

// local

// qt
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QString>

// stdlib
#include <memory>

class APIHandler
{
public:
    APIHandler(const QString &hostUrl);
    virtual ~APIHandler() = default;
    QNetworkReply *GetFilesList();
    QNetworkReply *DownloadFile(const QString &fileName);

private:
    QString m_hostUrl;
    std::unique_ptr<QNetworkAccessManager> m_networkManager;
};

#endif // API_HANDLER_H

{% endhighlight %}

And `api_handler.cpp` will be:

{% highlight cpp liones %}
// local
#include "api_handler.h"

namespace constants
{
    const QString FILES_ENDPOINT = "/api/files";
    const QString DOWNLOAD_FILE_ENDPOINT = "/api/download/file/";
}

APIHandler::APIHandler(const QString &hostUrl)
    : m_hostUrl(hostUrl)
{
    m_networkManager = std::make_unique<QNetworkAccessManager>();
}

QNetworkReply *APIHandler::GetFilesList()
{
    const QString url = m_hostUrl + constants::FILES_ENDPOINT;
    return m_networkManager->get(QNetworkRequest(url));
}

QNetworkReply *APIHandler::DownloadFile(const QString &fileName)
{
    const QString url = m_hostUrl + constants::DOWNLOAD_FILE_ENDPOINT + fileName;
    return m_networkManager->get(QNetworkRequest(url));
}
{% endhighlight %}

Finally, Modify `mainwindow.cpp` file to become:
{% highlight cpp liones %}
// local
#include "mainwindow.h"
#include "ui_mainwindow.h"

// qt
#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonObject>

namespace constants
{
    const QString BASE_URL = "http://127.0.0.1:3000";
    int STATUS_BAR_TIMEOUT = 5000;
    int MAX_CONTENT_LENGTH = 1000;
    namespace json_keys
    {
        const QString SUMMARY_KEY = "summary";
    }   // json_keys namespace
} // constants namespace
MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
    , m_apiHandler(std::make_unique<APIHandler>(constants::BASE_URL))
{
    ui->setupUi(this);
    // Get Files
    auto reply = m_apiHandler->GetFilesList();
    connect(reply, &QNetworkReply::finished, this, [reply, this]
    {
        if(reply->error() == QNetworkReply::NoError)
        {
            auto data = reply->readAll();
            QJsonDocument doc = QJsonDocument::fromJson(data);
            QJsonObject obj = doc.object();
            for(auto &&key: obj.keys()) {
                auto summary = obj.value(key).toObject()[constants::json_keys::SUMMARY_KEY].toString().toStdString();
                ui->filesComboBox->addItem(key);
                m_summaries.push_back(summary);
            }
            connect(ui->filesComboBox, QOverload<int>::of(&QComboBox::currentIndexChanged), [=](int index)
            {
                ui->fileSummaryLabel->setText(QString::fromStdString(m_summaries[index]));
            });
        }
        else
        {
            ui->statusbar->showMessage(reply->errorString(), constants::STATUS_BAR_TIMEOUT);
        }
        if(!m_summaries.empty())
        {
            ui->fileSummaryLabel->setText(QString::fromStdString(m_summaries[0]));
        }
        reply->deleteLater();
    });
    connect(ui->downloadButton, &QPushButton::clicked, this, [this]()
    {
        auto fileName = ui->filesComboBox->currentText();
        auto reply = m_apiHandler->DownloadFile(fileName);
        connect(reply, &QNetworkReply::finished, this, [this, reply]()
        {
            if(reply->error() == QNetworkReply::NoError)
            {
                auto data = reply->readAll();
                // Do What ever you want with data now.
                auto dataToDisplay = QString(data).left(std::min(constants::MAX_CONTENT_LENGTH, data.length()));
                if(data.length() > constants::MAX_CONTENT_LENGTH)
                {
                    dataToDisplay += "...";
                }
                ui->fileContent->setText(dataToDisplay);
            }
            else
            {
                ui->statusbar->showMessage(reply->errorString(), constants::STATUS_BAR_TIMEOUT);
            }
            reply->deleteLater();
        });
    });
}

MainWindow::~MainWindow()
{
    delete ui;
}
{% endhighlight %}

If you are familiar with Qt you would know that this is just a simple process, we have just created `QNetworkAccessManager` instance to make api calls, returned `QNetworkReply` and just connected to `finished` signal.

The current state can be found at this [commit.](https://github.com/Ali-Ibrahim137/Proxy-pattern-with-QNetworkReply/commit/1f857f7893ff37ed0dfd9ea70c945301f34a086e)

## Adding Proxy pattern using signals and slots (Bad approach)
By definition, Proxy is a structural design pattern that lets you provide a substitute or placeholder for another object. A proxy controls access to the original object, allowing you to perform something either before or after the request gets through to the original object.

In our case, proxy will be used both before and after the request gets through to the backend API, inside our proxy we will first check if this file was downloaded before, if it wasn't then call the end point, store the received `data` and next time return it.

But things here aren't as simple as you think, what should you store? You might think it's the received `QNetworkReply`. However there are many restrictions on this:
- `finished` signal won't be emitted if you use the reply, because this signal is emitted only once.
- `QNetworkReply` is a sequential-access `QIODevice`, which means that once data is read from the object, it is no longer kept by the device. It is therefore the application's responsibility to keep this data if it needs to.

Solution to this problem would be to use `signals and slots`. `APIHandler` class would now listen to `finished` signal, and emit different signals with the content read from the reply. To do so we will add three signals to `APIHandler` class, these signals will be:
{% highlight cpp liones %}
void FilesListObtained(const QByteArray &data);
void FileObtained(const QByteArray &data, const QString &fileName);
void Error(const QString &message);
{% endhighlight %}

`api_handler.cpp` will now look like this:
{% highlight cpp liones %}
void APIHandler::GetFilesList()
{
    const QString url = m_hostUrl + constants::FILES_ENDPOINT;
    auto reply = m_networkManager->get(QNetworkRequest(url));
    connect(reply, &QNetworkReply::finished, this, [reply, this]
    {
        if(reply->error() == QNetworkReply::NoError)
        {
            emit FilesListObtained(reply->readAll());
        }
        else
        {
            emit Error(reply->errorString());
        }
        reply->deleteLater();
    });
}

void APIHandler::DownloadFile(const QString &fileName)
{
    const QString url = m_hostUrl + constants::DOWNLOAD_FILE_ENDPOINT + fileName;
    auto reply = m_networkManager->get(QNetworkRequest(url));
    connect(reply, &QNetworkReply::finished, this, [reply, fileName, this]
    {
        if(reply->error() == QNetworkReply::NoError)
        {
            emit FileObtained(reply->readAll(), fileName);
        }
        else
        {
            emit Error(reply->errorString());
        }
        reply->deleteLater();
    });
}
{% endhighlight %}

Now it's the proxy responsibility to connect to these signals, and forward then to gui, Let's create `APIProxy` class. `api_proxy.h` will look like this:

{% highlight cpp liones %}
#ifndef API_PROXY_H
#define API_PROXY_H

// local
#include "api_handler.h"

// qt
#include <QObject>

// stdlib
#include <memory>
#include <map>

class APIProxy: public QObject
{
    Q_OBJECT
public:
    APIProxy(const QString &hostUrl);
    ~APIProxy() = default;
    void GetFilesList();
    void DownloadFile(const QString &fileName);

Q_SIGNALS:
    void FilesListObtained(const QByteArray &data);
    void FileObtained(const QByteArray &data);
    void Error(const QString &message);

private:
    void InitializeConnections();

private:
    std::unique_ptr<APIHandler> m_apiHandler;
    std::map<std::string, QByteArray> m_filesMap;
    QByteArray m_filesList;
};

#endif // API_PROXY_H
{% endhighlight %}

`api_proxy.cpp` will contain:

{% highlight cpp liones %}
// local
#include "api_proxy.h"

APIProxy::APIProxy(const QString &hostUrl)
{
    m_apiHandler = std::make_unique<APIHandler>(hostUrl);
    InitializeConnections();
}

void APIProxy::GetFilesList()
{
    if(m_filesList.size() != 0)
    {
        // Value is stored before, emit it as a signal.
        emit FilesListObtained(m_filesList);
    }
    else
    {
        // Call the endpoint.
        m_apiHandler->GetFilesList();
    }
}

void APIProxy::DownloadFile(const QString &fileName)
{
    if(auto iter = m_filesMap.find(fileName.toStdString()); iter != m_filesMap.end())
    {
        emit FileObtained(iter->second);
    }
    else
    {
        m_apiHandler->DownloadFile(fileName);
    }
}

void APIProxy::InitializeConnections()
{
    connect(m_apiHandler.get(), &APIHandler::FilesListObtained, this, [this](const QByteArray &data)
    {
        m_filesList = data;             // Store the value.
        emit FilesListObtained(data);   // Emit Signal.
    });
    connect(m_apiHandler.get(), &APIHandler::FileObtained, this, [this](const QByteArray &data, const QString &fileName)
    {
        m_filesMap[fileName.toStdString()] = data;
        emit FileObtained(data);
    });
    connect(m_apiHandler.get(), &APIHandler::Error, this, [this](const QString &message)
    {
        emit Error(message);
    });
}
{% endhighlight %}

`APIHandler` now will read data and emit signals, `GetFilesList()` will become:
{% highlight cpp liones %}
void APIHandler::GetFilesList()
{
    const QString url = m_hostUrl + constants::FILES_ENDPOINT;
    auto reply = m_networkManager->get(QNetworkRequest(url));
    connect(reply, &QNetworkReply::finished, this, [reply, this]
    {
        if(reply->error() == QNetworkReply::NoError)
        {
            emit FilesListObtained(reply->readAll());
        }
        else
        {
            emit Error(reply->errorString());
        }
        reply->deleteLater();
    });
}
{% endhighlight %}

Finally `mainwindow.cpp` will now listen to signals from `APIProxy`, it will look like this:
{% highlight cpp liones %}
void MainWindow::InitializeConnections()
{
    // APIProxy connections
    connect(m_apiProxy.get(), &APIProxy::FilesListObtained, this, [this](const QByteArray &data)
    {
        QJsonDocument doc = QJsonDocument::fromJson(data);
        QJsonObject obj = doc.object();
        for(auto &&key: obj.keys()) {
            auto summary = obj.value(key).toObject()[constants::json_keys::SUMMARY_KEY].toString().toStdString();
            ui->filesComboBox->addItem(key);
            m_summaries.push_back(summary);
        }
        if(!m_summaries.empty())
        {
            ui->fileSummaryLabel->setText(QString::fromStdString(m_summaries[0]));
        }
    });
    connect(m_apiProxy.get(), &APIProxy::FileObtained, this, [this](const QByteArray &data)
    {
        // Do What ever you want with data now.
        auto dataToDisplay = QString(data).left(std::min(constants::MAX_CONTENT_LENGTH, data.length()));
        if(data.length() > constants::MAX_CONTENT_LENGTH)
        {
            dataToDisplay += "...";
        }
        ui->fileContent->setText(dataToDisplay);
    });
    connect(m_apiProxy.get(), &APIProxy::Error, this, [this](const QString &message)
    {
        ui->statusbar->showMessage(message, constants::STATUS_BAR_TIMEOUT);
    });

    // UI connections
    connect(ui->filesComboBox, QOverload<int>::of(&QComboBox::currentIndexChanged), [=](int index)
    {
        if(index < static_cast<int>(m_summaries.size()))
        {
            ui->fileSummaryLabel->setText(QString::fromStdString(m_summaries[index]));
        }
    });
    connect(ui->downloadButton, &QPushButton::clicked, this, [this]()
    {
        auto fileName = ui->filesComboBox->currentText();
        m_apiProxy->DownloadFile(fileName);
    });
}
{% endhighlight %}

We can now see that the end point is called only once, therefore files are downloaded only once.

The current state can be found at this [commit.](https://github.com/Ali-Ibrahim137/Proxy-pattern-with-QNetworkReply/commit/b91c4a9ca4942db8520b3e96674458618f063e6c)

Now this approach faces many issues:
- Too many signals, in our project we had about 30 api endpoints, and it was very painful to add all these signals.
- You call a function somewhere, and the slot is in another place, I mean in our case we are calling `GetFilesList()` in the constructor, but the code related to slot is somewhere else.
- You don't actually what part of your code called the function responsible for the slot, let's say you want to download some file and display parts of it in some case, in other case you want to do something with it's contents. You have to add some thing to specify who made the call, and this gets very smelly and hard to track.

Let's see the next approach.

## Adding Proxy pattern using APIReply class (Better approach)
We will add `APIReply` class as a wrapper for `QNetworkReply` it will be a class with the exact same methods and signals that we are using in our application, and now we will connect to signals from our `APIReply` class, similar to our first use case without proxy, let's jump to the code. `api_reply.h` will contain:
{% highlight cpp liones %}
#ifndef API_REPLY_H
#define API_REPLY_H

// qt
#include <QByteArray>
#include <QNetworkReply>
#include <QObject>

class APIReply : public QObject
{
    Q_OBJECT

public:
    APIReply(QNetworkReply *reply);
    APIReply(const QByteArray &array);

    ~APIReply();

    QByteArray readAll();

    QNetworkReply::NetworkError error();

    QString errorString();

Q_SIGNALS:
    void finished();

private:
    QNetworkReply *m_reply;
    QByteArray m_array;
};

#endif // API_REPLY_H
{% endhighlight %}

`api_reply.cpp` will contain:
{% highlight cpp liones %}
// local
#include "api_reply.h"

// qt
#include <QTimer>

APIReply::APIReply(QNetworkReply *reply)
    : m_reply(reply)
    , m_array()
{
    // Call the endpoint
    connect(m_reply, &QNetworkReply::finished, this, [this]
    {
        if (m_reply->error() == QNetworkReply::NoError)
        {
            // Store the value
            m_array = m_reply->readAll();
        }
        // emit APIReply finished signal
        emit finished();
    });
}

APIReply::APIReply(const QByteArray &array)
    : m_reply(nullptr)
    , m_array(array)
{
    // Value is stored before, emit APIReply finished signal
    QTimer::singleShot(0, this, SIGNAL(finished()));
}

APIReply::~APIReply()
{
    if (m_reply)
    {
        // delete reply
        m_reply->deleteLater();
    }
}

QByteArray APIReply::readAll()
{
    return m_array;
}

QNetworkReply::NetworkError APIReply::error()
{
    if (m_reply)
    {
        return m_reply->error();
    }
    return QNetworkReply::NetworkError::NoError;
}

QString APIReply::errorString()
{
    if (m_reply)
    {
        return m_reply->errorString();
    }
    return QString();
}
{% endhighlight %}

`APIReply` class contains two constructors, one that takes `QNetworkReply`, connects to finished signal, reads the data and stores it locally, and another constructor that takes the previously read `QByteArray` and emits the finished signal immediately. This way in `mainwindow.cpp` we can use exactly the same way as our implementation without proxy.

Complete code can be found at [this repo](https://github.com/Ali-Ibrahim137/Proxy-pattern-with-QNetworkReply).

### Conclusion
In this article we went through describing the problem of using Proxy design pattern with `QNetworkReply`, we have shown two different ways to solve the problem, one is complex and smelly, the second one is more clean and much better.

I hope you liked this article, please stay tuned for more.
